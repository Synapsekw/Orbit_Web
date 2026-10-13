import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export function checkFile(path,data,secrets=[]){
 if(path!=='.env.example'&&(/(?:^|\/)(?:\.env(?:\.|$)|\.local(?:\/|$)|node_modules(?:\/|$)|dist(?:\/|$)|assets-source(?:\/|$)|\.playwright-mcp(?:\/|$))/i.test(path)||/\.local\.json$/i.test(path)))throw new Error('Private or generated file in Git: '+path);
 if(data.length>=100*1024*1024)throw new Error('File reaches GitHub’s 100 MiB limit: '+path);
 for(const secret of secrets)if(secret&&secret.length>10&&data.includes(Buffer.from(secret)))throw new Error('Configured secret found in Git: '+path);
 const text=data.toString('utf8');
 if(/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{40,}|\bgh[pousr]_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{40,}|https:\/\/api2\.cursor\.sh\/automations\/webhook\/[a-zA-Z0-9-]{24,}/.test(text))throw new Error('Credential pattern found in Git: '+path);
}

export function scanRepository(){
 const records=execFileSync('git',['ls-files','--stage','-z'],{encoding:'utf8'}).split('\0').filter(Boolean).map(record=>{
  const match=/^\d+ ([a-f0-9]+) (\d)\t([\s\S]+)$/.exec(record);
  if(!match||match[2]!=='0')throw new Error('Unresolved Git index entry');
  return {oid:match[1],path:match[3]};
 });
 if(!records.length)throw new Error('No staged or tracked files to inspect.');
 // Read the index blobs rather than working files, so an unstaged edit cannot
 // conceal a credential that would still be included in the next commit.
 const blobs=execFileSync('git',['cat-file','--batch'],{input:records.map(r=>r.oid).join('\n')+'\n',maxBuffer:512*1024*1024});
 const secrets=['OPENAI_API_KEY','ORBI_SESSION_SECRET','GROKBOT_WEBHOOK_KEY','GROKBOT_WEBHOOK_URL','GROKBOT_AUTHORIZATION_HEADER'].map(name=>process.env[name]).filter(Boolean);
 let offset=0,total=0;
 for(const record of records){
  const end=blobs.indexOf(10,offset),header=blobs.subarray(offset,end).toString('utf8');
  const match=/^([a-f0-9]+) blob (\d+)$/.exec(header);
  if(!match||match[1]!==record.oid)throw new Error('Could not read Git content: '+record.path);
  const size=Number(match[2]);offset=end+1;checkFile(record.path,blobs.subarray(offset,offset+size),secrets);offset+=size+1;total+=size;
 }
 console.log(`Checked ${records.length} Git files (${(total/1024/1024).toFixed(1)} MiB); no private files or detected credentials.`);
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))scanRepository();
