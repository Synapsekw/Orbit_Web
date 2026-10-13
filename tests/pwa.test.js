import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import sharp from 'sharp';

const origin='https://orbitaerials.com';
const publicFile=path=>new URL('../public'+path,import.meta.url);
const keyOf=request=>new URL(typeof request==='string'?request:request.url,origin).href;

// Run the real worker with in-memory versions of browser-only CacheStorage and events.
async function worker(){
 const source=await readFile(publicFile('/sw.js'),'utf8');
 const handlers=new Map(),stores=new Map(),requests=[];
 let network=async request=>{
  const path=new URL(request.url).pathname;
  return new Response(await readFile(publicFile(path)),{headers:{'Content-Type':path.endsWith('.html')?'text/html':'image/png'}});
 };
 const caches={
  async open(name){
   if(!stores.has(name))stores.set(name,new Map());
   const store=stores.get(name);
   return {
    async put(request,response){store.set(keyOf(request),response.clone());},
    async match(request){return store.get(keyOf(request))?.clone();},
    async keys(){return [...store.keys()].map(url=>new Request(url));},
   };
  },
  async keys(){return [...stores.keys()];},
  async delete(name){return stores.delete(name);},
 };
 let forcedActivation=0,claimedClients=0;
 const self={
  location:new URL(origin+'/sw.js'),
  addEventListener(type,handler){handlers.set(type,handler);},
  skipWaiting(){forcedActivation++;},
  clients:{claim(){claimedClients++;}},
 };
 vm.runInNewContext(source,{self,caches,Request,Response,URL,Set,Promise,fetch:async request=>{requests.push(request);return network(request);}});
 return {
  caches,requests,stores,
  setNetwork(fn){network=fn;},
  async lifecycle(type){const pending=[];handlers.get(type)?.({waitUntil(promise){pending.push(promise);}});await Promise.all(pending);},
  async request(path,options={}){
   const request={url:new URL(path,origin).href,method:'GET',mode:'cors',credentials:'same-origin',headers:new Headers(),...options};
   let response;
   const pending=[];
   handlers.get('fetch')?.({request,respondWith(value){response=Promise.resolve(value);},waitUntil(promise){pending.push(promise);}});
   const result=response?await response:undefined;
   await Promise.all(pending);
   return result;
  },
  get forcedActivation(){return forcedActivation;},
  get claimedClients(){return claimedClients;},
 };
}

test('install precaches only a finite public fallback and icons without credentials',async()=>{
 const app=await worker();
 await app.lifecycle('install');
 assert.equal(app.stores.size,1);
 const paths=app.requests.map(request=>new URL(request.url).pathname).sort();
 assert.deepEqual(paths,['/icons/apple-touch-icon.png','/icons/orbit-192.png','/icons/orbit-512.png','/icons/orbit-maskable-192.png','/icons/orbit-maskable-512.png','/offline.html']);
 const bytes=await Promise.all(paths.map(async path=>(await readFile(publicFile(path))).byteLength));
 assert.ok(bytes.reduce((sum,size)=>sum+size,0)<200*1024,'The complete offline download must stay below 200 KiB.');
 for(const request of app.requests){
  assert.equal(request.credentials,'omit');
  assert.equal(request.cache,'reload');
  assert.equal(request.redirect,'error');
 }
 assert.equal(app.forcedActivation,0);
});

test('online documents always use the network and never enter CacheStorage',async()=>{
 const app=await worker();
 await app.lifecycle('install');
 let version=1;
 app.setNetwork(async()=>new Response('Live page '+version++));
 assert.equal(await (await app.request('/services/',{mode:'navigate'})).text(),'Live page 1');
 assert.equal(await (await app.request('/services/',{mode:'navigate'})).text(),'Live page 2');
 const keys=[...app.stores.values()].flatMap(store=>[...store.keys()]);
 assert.equal(keys.length,6);
 assert.ok(!keys.includes(origin+'/services/'));
});

test('offline navigation serves self-contained contact information without private URL data',async()=>{
 const app=await worker();
 await app.lifecycle('install');
 app.setNetwork(async()=>{throw new TypeError('offline');});
 const response=await app.request('/contact/',{mode:'navigate'});
 assert.equal(response.status,503);
 assert.match(response.headers.get('Content-Type'),/text\/html/);
 assert.equal(response.headers.get('Cache-Control'),'no-store');
 const html=await response.text();
 assert.match(html,/<h1[^>]*>You.re offline/);
 assert.match(html,/href="tel:\+96599111397"/);
 assert.match(html,/href="mailto:info@orbitaerials.com"/);
 assert.match(html,/href="\/"/);
 assert.doesNotMatch(html,/<(?:script|link|img)\b[^>]*(?:src|href)="(?:https?:|\/)/);
});

test('real HTTP error pages are preserved instead of being replaced by the offline page',async()=>{
 const app=await worker();
 await app.lifecycle('install');
 app.setNetwork(async()=>new Response('Not found',{status:404}));
 const response=await app.request('/missing/',{mode:'navigate'});
 assert.equal(response.status,404);
 assert.equal(await response.text(),'Not found');
});

test('API, chat, credentials, queries, external requests, models and media bypass the worker',async()=>{
 const app=await worker();
 await app.lifecycle('install');
 const before=app.requests.length;
 const bypasses=[
  ['/api/orbi',{mode:'navigate'}],['/.netlify/functions/orbi',{mode:'navigate'}],
  ['/orbi/callback',{mode:'navigate'}],['/auth/callback',{mode:'navigate'}],
  ['/callback',{mode:'navigate'}],['/services/?token=private',{mode:'navigate'}],
  ['/icons/orbit-192.png?version=1',{}],['https://other.example/offline.html',{mode:'navigate'}],
  ['/contact/',{method:'POST',mode:'navigate'}],['/icons/orbit-192.png',{credentials:'include'}],
  ['/services/',{mode:'navigate',headers:new Headers({Authorization:'Bearer private'})}],
  ['/models/m400-flight.glb',{}],['/media/site.webp',{}],['/assets/site-12345678.js',{}],
 ];
 for(const [path,options] of bypasses)assert.equal(await app.request(path,options),undefined,path);
 assert.equal(app.requests.length,before);
 assert.equal([...app.stores.values()].reduce((size,store)=>size+store.size,0),6);
});

test('only allowlisted static files are served offline and cache failures do not break online files',async()=>{
 const app=await worker();
 await app.lifecycle('install');
 app.setNetwork(async()=>{throw new TypeError('offline');});
 const icon=await app.request('/icons/orbit-192.png');
 assert.match(icon.headers.get('Content-Type'),/image\/png/);
 assert.ok((await icon.arrayBuffer()).byteLength>100);
 app.caches.open=async()=>{throw new Error('Storage unavailable');};
 app.setNetwork(async()=>new Response('network icon'));
 assert.equal(await (await app.request('/icons/orbit-192.png')).text(),'network icon');
});

test('activation deletes obsolete Orbit PWA caches only and never takes over open clients',async()=>{
 const app=await worker();
 await app.lifecycle('install');
 const current=[...app.stores.keys()][0];
 await app.caches.open('orbit-pwa-obsolete');
 await app.caches.open('another-app-v1');
 await app.lifecycle('activate');
 assert.deepEqual((await app.caches.keys()).sort(),['another-app-v1',current].sort());
 assert.equal(app.forcedActivation,0);
 assert.equal(app.claimedClients,0);
});

test('an invalid precache response prevents installation instead of caching an error page',async()=>{
 const app=await worker();
 app.setNetwork(async()=>new Response('Sign in',{status:200,headers:{'Content-Type':'text/html','Cache-Control':'private'}}));
 await assert.rejects(app.lifecycle('install'));
 assert.equal([...app.stores.values()].reduce((size,store)=>size+store.size,0),0);
});

test('manifest icons exist at declared sizes and maskable artwork fits the safe area',async()=>{
 const manifest=JSON.parse(await readFile(publicFile('/manifest.webmanifest'),'utf8'));
 assert.equal(manifest.name,'Orbit Aerials');
 assert.equal(manifest.start_url,'/');
 assert.equal(manifest.id,'/');
 assert.equal(manifest.scope,'/');
 assert.equal(manifest.display,'standalone');
 for(const purpose of ['any','maskable']){
  for(const size of [192,512]){
   const icon=manifest.icons.find(icon=>icon.purpose===purpose&&icon.sizes===`${size}x${size}`);
   assert.ok(icon,`${purpose} ${size}`);
   const input=await readFile(publicFile(icon.src));
   const metadata=await sharp(input).metadata();
   assert.equal(metadata.width,size);
   assert.equal(metadata.height,size);
   if(purpose==='maskable'){
    const {data,info}=await sharp(input).removeAlpha().raw().toBuffer({resolveWithObject:true});
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
     if(Math.hypot(x+.5-size/2,y+.5-size/2)<=size*.4)continue;
     const offset=(y*size+x)*info.channels;
     assert.deepEqual([...data.subarray(offset,offset+3)],[7,20,33],`outside safe zone: ${x},${y}`);
    }
   }
  }
 }
 const apple=await sharp(await readFile(publicFile('/icons/apple-touch-icon.png'))).metadata();
 assert.equal(apple.width,180);
 assert.equal(apple.height,180);
});

test('the ICO contains valid small Orbi PNGs for browser tabs',async()=>{
 const ico=await readFile(publicFile('/favicon.ico'));
 assert.equal(ico.readUInt16LE(0),0);
 assert.equal(ico.readUInt16LE(2),1);
 assert.equal(ico.readUInt16LE(4),3);
 for(let index=0;index<3;index++){
  const start=6+index*16,size=[16,32,48][index];
  assert.equal(ico[start],size);
  assert.equal(ico[start+1],size);
  const length=ico.readUInt32LE(start+8),offset=ico.readUInt32LE(start+12);
  const png=ico.subarray(offset,offset+length),metadata=await sharp(png).metadata();
  assert.equal(metadata.width,size);
  assert.equal(metadata.height,size);
  if(size<48)assert.deepEqual(png,await readFile(publicFile(`/favicon-${size}.png`)));
 }
});

async function registration({production=true,secure=true,supported=true,readyState='loading',reject=false}={}){
 const source=(await readFile(new URL('../src/site/pwa.js',import.meta.url),'utf8')).replaceAll('import.meta.env.PROD',String(production)).replace('export function registerPwa','function registerPwa');
 const listeners=new Map(),calls=[];
 const window={isSecureContext:secure,addEventListener(type,fn,options){listeners.set(type,{fn,options});}};
 const navigator=supported?{serviceWorker:{register:async(...args)=>{calls.push(args);if(reject)throw new Error('disabled');return {};}}}:{};
 const context=vm.createContext({window,navigator,document:{readyState},Promise});
 vm.runInContext(source+'\nregisterPwa();',context);
 return {calls,listeners,context};
}

test('registration waits for page load and asks the browser to revalidate worker updates',async()=>{
 const app=await registration();
 assert.equal(app.calls.length,0);
 assert.equal(app.listeners.get('load')?.options.once,true);
 await app.listeners.get('load').fn();
 assert.equal(app.calls[0][0],'/sw.js');
 assert.equal(app.calls[0][1].scope,'/');
 assert.equal(app.calls[0][1].updateViaCache,'none');
});

test('registration supports already-loaded production previews and handles unavailable browsers',async()=>{
 assert.equal((await registration({readyState:'complete'})).calls.length,1);
 for(const options of [{production:false},{secure:false},{supported:false}]){
  const app=await registration({...options,readyState:'complete'});
  assert.equal(app.calls.length,0);
  assert.equal(app.listeners.size,0);
 }
 const app=await registration({reject:true});
 await assert.doesNotReject(app.listeners.get('load').fn());
});
