import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const secrets=['OPENAI_API_KEY','ORBI_SESSION_SECRET','GROKBOT_WEBHOOK_KEY','GROKBOT_WEBHOOK_URL','GROKBOT_AUTHORIZATION_HEADER'].map(key=>process.env[key]).filter(value=>value&&value.length>10);
let count=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const path=dir+'/'+entry.name;
 assert.ok(!/(?:^|\/)(?:\.env(?:\.|$)|server|netlify|node_modules)|\.local\.json$|\.php$/i.test(path),'Private file in public build: '+path);
 if(entry.isDirectory())await walk(path);else{const data=await readFile(path);for(const secret of secrets)assert.ok(!data.includes(Buffer.from(secret)),'Secret present in public build');count++;}
}}
await walk('dist');assert.ok(count>10);console.log(`Checked ${count} public files; no private configuration or configured credentials found.`);
