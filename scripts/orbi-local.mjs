import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {Readable} from 'node:stream';
import {loadEnv} from 'vite';
import {createOrbiHandler} from '../netlify/lib/orbi.mjs';
import {readConfig} from '../netlify/lib/config.mjs';
export function readLocalConfig(env,{mock=false}={}){
 const config=readConfig({...env,CONTEXT:'production',ORBI_ENABLED:env.ORBI_LOCAL_ENABLED==='true'||mock?'true':'false',
  ...(mock?{OPENAI_API_KEY:'local-fixture',ORBI_SESSION_SECRET:randomBytes(32).toString('hex'),GROKBOT_WEBHOOK_URL:'https://api2.cursor.sh/automations/webhook/local-fixture',GROKBOT_WEBHOOK_KEY:'local-fixture',GROKBOT_AUTHORIZATION_HEADER:''}:{})});
 config.local=true;config.mock=mock;
 // Provider activation does not activate notifications. Enable the latter only
 // for an owner-authorised handoff test using the visitor-reviewed form.
 if(!mock&&env.ORBI_LOCAL_CALLBACKS_ENABLED!=='true')config.callback=null;
 return config;
}
// Only installed in Vite's loopback development/preview server, never a function.
export function orbiLocal(){
 let handlerPromise;
 async function handler(){
  const env=loadEnv('development',process.cwd(),'');
  const mock=process.env.ORBI_MOCK==='true';
  const config=readLocalConfig(env,{mock});
  let store,knowledge='';
  if(config.ready){
   const {PGlite}=await import('@electric-sql/pglite');const {PostgresStore}=await import('../netlify/lib/store.mjs');
   const db=new PGlite();await db.exec(await readFile('netlify/database/migrations/0001_orbi.sql','utf8'));
   let tail=Promise.resolve();const pool={async connect(){const prior=tail;let release;tail=new Promise(r=>release=r);await prior;return {query:(sql,args)=>db.query(sql,args),release};},async query(sql,args){const c=await this.connect();try{return await c.query(sql,args);}finally{c.release();}}};
   store=new PostgresStore(pool,config.secret);knowledge=await readFile('server/knowledge.txt','utf8');
  }
  const fake=async(url,options)=>{
   if(url.includes('api2.cursor.sh'))return Response.json({test:true});
   const body=JSON.parse(options.body),message=body.messages.at(-1).content;
   const reply=/[\u0600-\u06ff]/.test(message)?'معاينة اختبارية: أستطيع مساعدتك في استكشاف خدمات المسح والتفتيش بالطائرات بدون طيار. ما نوع الموقع؟':'Local test reply: Orbit operates the DJI M400, M350 RTK and Elios 3. The capture approach depends on the asset, environment and output you need.';
   return Response.json({choices:[{message:{content:JSON.stringify({reply,topic:'fleet',source_ids:['S9'],analysis:{intent:'enquiry',urgency:'normal',summary:'Test',next_step:'Review'},contact_request:/contact|call|enquir/i.test(message)?{name:'',phone:'',email:'',company:'',reason:'Discuss a drone inspection project',preferred_time:'',timezone:''}:null})}}]});
  };
  return createOrbiHandler({config,store,knowledge,...(mock?{fetch:fake}:{})});
 }
 const middleware=async(req,res,next)=>{
  if(!req.url?.startsWith('/api/orbi?'))return next();
  const address=req.socket.remoteAddress;
  if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(address)){res.writeHead(403);res.end();return;}
  const origin='http://'+req.headers.host;
  if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)){res.writeHead(403);res.end();return;}
  try{
   const processRequest=await(handlerPromise??=handler());
   const request=new Request(origin+req.url,{method:req.method,headers:req.headers,...(req.method!=='GET'?{body:Readable.toWeb(req),duplex:'half'}:{})});
   const response=await processRequest(request,{ip:address,localOrigin:origin});
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Orbi could not connect.'}));}
 };
 return {name:'orbi-loopback-api',configureServer(server){server.middlewares.use(middleware);},configurePreviewServer(server){server.middlewares.use(middleware);}};
}
