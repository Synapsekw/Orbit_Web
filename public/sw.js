/* Bump this version whenever the offline document or app icons change. */
const CACHE_PREFIX='orbit-pwa-';
const CACHE_NAME=CACHE_PREFIX+'v1';
const OFFLINE_URL='/offline.html';
const PUBLIC_FILES=new Set([
 OFFLINE_URL,
 '/icons/orbit-192.png',
 '/icons/orbit-512.png',
 '/icons/orbit-maskable-192.png',
 '/icons/orbit-maskable-512.png',
 '/icons/apple-touch-icon.png',
]);

self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  // Fetch only these public files, without cookies or HTTP authentication.
  // Validate all responses before putting anything into the new cache.
  const entries=await Promise.all([...PUBLIC_FILES].map(async path=>{
   const request=new Request(new URL(path,self.location.origin),{credentials:'omit',cache:'reload',redirect:'error'});
   const response=await fetch(request);
   const contentType=response.headers.get('Content-Type')||'';
   const expected=path===OFFLINE_URL?'text/html':'image/png';
   if(!response.ok||response.redirected||!contentType.toLowerCase().startsWith(expected)||/\b(?:private|no-store)\b/i.test(response.headers.get('Cache-Control')||'')){
    throw new Error('Invalid public offline asset: '+path);
   }
   return [request,response];
  }));
  const cache=await caches.open(CACHE_NAME);
  await Promise.all(entries.map(([request,response])=>cache.put(request,response)));
 })());
 // Let an updated worker wait until existing tabs close. Never force a reload.
});

self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME).map(name=>caches.delete(name)));
 })());
 // No clients.claim(): an already-open page keeps its current lifecycle.
});

async function cachedPublicFile(path){
 try{return await (await caches.open(CACHE_NAME)).match(new URL(path,self.location.origin).href);}
 catch{return undefined;}
}

async function navigate(request){
 try{return await fetch(request);}
 catch{
  const fallback=await cachedPublicFile(OFFLINE_URL);
  if(fallback)return new Response(await fallback.text(),{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  return new Response('You are offline. Reconnect to visit Orbit Aerials, or call +965 9911 1397.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
 }
}

self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Bypass non-public traffic entirely, including navigations to callback/API URLs.
 if(request.method!=='GET'||url.origin!==self.location.origin||url.search||url.username||url.password||request.headers.has('Authorization')||request.headers.has('Range'))return;
 if(/^\/(?:api|\.netlify|orbi|orbi-preview|auth|oauth|callback)(?:\/|$)/i.test(url.pathname))return;
 if(request.mode==='navigate'){
  // Network-only documents: never save a page, query, form or conversation.
  event.respondWith(navigate(request));
  return;
 }
 if(request.credentials==='include'||!PUBLIC_FILES.has(url.pathname))return;
 event.respondWith((async()=>await cachedPublicFile(url.pathname)||fetch(request))());
});
