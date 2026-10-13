import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {promisify} from 'node:util';
import {routes,services,serviceChoices} from '../src/site/data.js';
import {loadArticles} from '../scripts/journal.mjs';
import {isPublicBuild} from '../src/site/seo.js';

const run=promisify(execFile);
const schemas=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const pageFile=route=>route.path==='/'?'index.html':route.path.slice(1)+'index.html';

async function isolatedBuild(t,context){
 const output=await mkdtemp(join(tmpdir(),'orbit-seo-'));
 t.after(()=>rm(output,{recursive:true,force:true}));
 // The generator reads source files from its own location and writes only here.
 await run(process.execPath,[resolve('scripts/build-site.mjs')],{cwd:output,env:{...process.env,ORBIT_PUBLIC_BUILD:'1',CONTEXT:context,VERCEL_ENV:''}});
 return file=>readFile(join(output,file),'utf8');
}

test('commercial landing pages have distinct Kuwait search titles and descriptions',()=>{
 const commercial=routes.filter(r=>['home','industries','services','service','fleet','about','contact'].includes(r.type));
 for(const route of commercial){
  assert.match(route.title,/Kuwait/,route.path+' needs a descriptive local title');
  assert.match(route.description,/Kuwait/,route.path+' needs a local description');
  assert.ok(route.description.length>=70&&route.description.length<=165,route.path+' description length');
 }
 assert.equal(new Set(routes.map(r=>r.title)).size,routes.length,'Titles must identify their own page');
 assert.equal(new Set(routes.map(r=>r.description)).size,routes.length,'Descriptions must identify their own page');
});

test('indexing requires an explicit public build and a production hosting context',()=>{
 for(const [env,want] of [
  [{},false],
  [{ORBIT_PUBLIC_BUILD:'0',CONTEXT:'production'},false],
  [{ORBIT_PUBLIC_BUILD:'1'},true],
  [{ORBIT_PUBLIC_BUILD:'1',CONTEXT:'production'},true],
  [{ORBIT_PUBLIC_BUILD:'1',CONTEXT:'deploy-preview'},false],
  [{ORBIT_PUBLIC_BUILD:'1',CONTEXT:'branch-deploy'},false],
  [{ORBIT_PUBLIC_BUILD:'1',CONTEXT:'dev'},false],
  [{ORBIT_PUBLIC_BUILD:'1',VERCEL_ENV:'preview'},false],
  [{ORBIT_PUBLIC_BUILD:'1',VERCEL_ENV:'production'},true],
  [{ORBIT_PUBLIC_BUILD:'1',CONTEXT:'deploy-preview',VERCEL_ENV:'production'},false]
 ])assert.equal(isPublicBuild(env),want,JSON.stringify(env));
});

test('each service has one enquiry choice and one canonical landing page',()=>{
 assert.equal(new Set(serviceChoices.map(s=>s.slug)).size,serviceChoices.length);
 for(const service of services)assert.equal(routes.filter(r=>r.path===`/services/${service.slug}/`).length,1);
});

test('production publishes local business, site and page identity with truthful service markup',async t=>{
 const read=await isolatedBuild(t,'production');
 for(const route of routes){
  const html=await read(pageFile(route)),data=schemas(html),graph=data.flatMap(s=>s['@graph']||[s]);
  assert.match(html,/<meta name="robots" content="index,follow,max-image-preview:large">/);
  assert.match(html,/<link rel="manifest" href="\/manifest.webmanifest">/);
  assert.match(html,/<link rel="apple-touch-icon" href="\/icons\/apple-touch-icon.png" sizes="180x180">/);
  assert.match(html,/<link rel="icon" href="\/favicon.ico"/);
  const bootstrap=html.indexOf('<script>document.documentElement.classList.add("js")</script>');
  assert.ok(bootstrap>0&&bootstrap<html.indexOf('rel="stylesheet"'),'Mobile enhancement must be selected before styles can paint');
  assert.match(html,/<meta property="og:site_name" content="Orbit Aerials">/);
  assert.match(html,/<meta name="twitter:title" content="[^"]+">/);
  assert.match(html,/<meta name="twitter:description" content="[^"]+">/);
  assert.match(html,/<meta name="twitter:image" content="https:\/\/www\.orbitaerials\.com\/media\//);
  const canonical=html.match(/<link rel="canonical" href="([^"]+)">/)[1];
  assert.equal(canonical,'https://www.orbitaerials.com'+route.path);
  const org=graph.find(s=>[].concat(s['@type']).includes('LocalBusiness'));
  assert.equal(org.name,'Orbit Aerials');assert.equal(org.telephone,'+96599111397');
  assert.deepEqual(org.address,{'@type':'PostalAddress',streetAddress:'Burj Al Tujjar',addressLocality:'Kuwait City',addressCountry:'KW'});
  assert.ok(html.includes('Burj Al Tujjar, Kuwait City, Kuwait'));
  assert.ok(html.includes('Sunday–Thursday, 09:00–16:00'));
  assert.ok(graph.some(s=>s['@type']==='WebSite'&&s.url==='https://www.orbitaerials.com/'));
  const page=graph.find(s=>[].concat(s['@type']).includes('WebPage'));
  assert.equal(page.url,canonical);assert.equal(page.description,route.description);
  assert.equal(page.isPartOf['@id'],'https://www.orbitaerials.com/#website');
  assert.doesNotMatch(JSON.stringify(data),/aggregateRating|reviewRating|hasCertification|priceRange/);
  if(route.type==='service'){
   const service=graph.find(s=>s['@type']==='Service'),visible=services.find(s=>s.slug===route.slug);
   assert.equal(service.name,visible.name);assert.equal(service.description,visible.description);
   assert.equal(service.url,canonical);assert.equal(service.areaServed.name,'Kuwait');
   assert.equal(service.provider['@id'],org['@id']);
   assert.ok(html.includes(visible.description),'Service schema description must appear in the rendered content');
  }
  const breadcrumb=data.find(s=>s['@type']==='BreadcrumbList');
  if(route.path==='/')assert.equal(breadcrumb,undefined);
  else{
   assert.equal(breadcrumb.itemListElement[0].item,'https://www.orbitaerials.com/');
   assert.equal(breadcrumb.itemListElement.at(-1).item,canonical);
   assert.deepEqual(breadcrumb.itemListElement.map(s=>s.position),breadcrumb.itemListElement.map((_,i)=>i+1));
   assert.match(html,/<nav class="site-breadcrumb wrap" aria-label="Breadcrumb">/);
  }
  if(route.type==='article'){
   const article=data.find(s=>s['@type']==='BlogPosting');
   assert.equal(article.mainEntityOfPage['@id'],canonical);
   assert.equal(breadcrumb.itemListElement[1].item,'https://www.orbitaerials.com/journal/');
  }
 }
 const home=await read('index.html');
 assert.match(home,/<link rel="preload" href="\/models\/m400-flight.json" as="fetch" crossorigin>/);
 assert.doesNotMatch(await read('contact/index.html'),/rel="preload"[^>]*m400-flight/);
});

test('a leaked production flag cannot index a deploy preview or submit its pages in a sitemap',async t=>{
 const read=await isolatedBuild(t,'deploy-preview');
 for(const route of routes)assert.match(await read(pageFile(route)),/<meta name="robots" content="noindex,nofollow">/);
 assert.match(await read('public/_headers'),/\/\*\n\s+X-Robots-Tag: noindex, nofollow/);
 assert.doesNotMatch(await read('public/sitemap.xml'),/<url>/);
 assert.doesNotMatch(await read('public/robots.txt'),/Disallow:\s*\/\s*(?:\n|$)/,'Crawlers must be able to read noindex');
});

test('only published canonical routes enter the sitemap and missing URLs have a real 404 document',async t=>{
 const read=await isolatedBuild(t,'production'),sitemap=await read('public/sitemap.xml');
 const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(locs.length,routes.length);assert.equal(new Set(locs).size,locs.length);
 for(const route of routes)assert.ok(locs.includes('https://www.orbitaerials.com'+route.path));
 for(const article of await loadArticles()){
  if(article.status==='draft')assert.ok(!sitemap.includes(article.path));
  else if(article.originalUrl)assert.ok(locs.includes(article.originalUrl.replace(/\/$/,'')+'/'));
 }
 assert.doesNotMatch(sitemap,/404|design-concepts|orbi-preview/);
 const missing=await read('404.html');
 assert.match(missing,/<h1[^>]*>Page not found[.<]/);
 assert.match(missing,/<meta name="robots" content="noindex,nofollow">/);
 assert.doesNotMatch(missing,/rel="canonical"|application\/ld\+json/,'Missing pages must not claim to be the homepage');
 assert.ok(JSON.parse(await read('pages-manifest.json')).includes('404.html'));
 const redirects=await read('public/_redirects');
 assert.doesNotMatch(redirects,/\/\*\s+\/index\.html\s+200/,'No soft-404 SPA fallback');
 for(const rule of ['/image-credits.html /image-credits/ 301!','/policy /privacy/ 301!','/policy/ /privacy/ 301!'])assert.ok(redirects.includes(rule),'Server redirects must take precedence over static HTML fallbacks: '+rule);
 const headers=await read('public/_headers');
 for(const path of ['/design-concepts/*','/orbi-preview/*','/orbi/*'])assert.ok(headers.includes(path+'\n  X-Robots-Tag: noindex, nofollow'));
 for(const file of ['public/orbi/preview.html','design-concepts/round-5/index.html','design-concepts/round-6/index.html']){
  const preview=await read(file);
  assert.equal((preview.match(/name="robots"/g)||[]).length,1);
  assert.match(preview,/<meta name="robots" content="noindex,nofollow">/);
  assert.ok(!/[ \t]+\r?$/m.test(preview),file+' must not acquire trailing whitespace');
 }
});
