import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {routes,articles} from '../src/site/data.js';
import {renderPage,esc} from '../src/site/render.js';
import {canonicalUrl,isPublicBuild,socialImageFor,structuredDataFor} from '../src/site/seo.js';

const sourceRoot=fileURLToPath(new URL('../',import.meta.url));
const privacy=await readFile(resolve(sourceRoot,'src/privacy-content.html'),'utf8');
const publicBuild=isPublicBuild(process.env);
const indexMode=publicBuild?'index,follow,max-image-preview:large':'noindex,nofollow';
const jsonLd=value=>`<script type="application/ld+json">${JSON.stringify(value).replaceAll('<','\\u003c')}</script>`;
const imageSizes=new Map();
async function imageSize(url){
 if(!imageSizes.has(url)){
  const {width,height}=await sharp(resolve(sourceRoot,'public'+new URL(url).pathname)).metadata();
  imageSizes.set(url,{width,height});
 }
 return imageSizes.get(url);
}
async function save(file,contents){await mkdir(dirname(file),{recursive:true});await writeFile(file,contents);}

for(const route of routes){
 const file=(route.path==='/'?'':route.path.slice(1))+'index.html';
 const title=route.title+' · Orbit Aerials',canonical=canonicalUrl(route.path);
 const article=route.type==='article'?articles.find(a=>a.slug===route.slug):null;
 const social=socialImageFor(route),size=await imageSize(social.url);
 const head=`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#071421"><meta name="robots" content="${indexMode}"><title>${esc(title)}</title><meta name="description" content="${esc(route.description)}"><link rel="canonical" href="${canonical}"><link rel="alternate" type="application/rss+xml" title="The Orbit Journal" href="/journal.xml"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/src/site/site.css">${route.type==='home'?'<link rel="preload" href="/models/m400-flight.json" as="fetch" crossorigin>':''}<meta property="og:type" content="${article?'article':'website'}"><meta property="og:site_name" content="Orbit Aerials"><meta property="og:locale" content="en_KW"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(route.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${social.url}"><meta property="og:image:secure_url" content="${social.url}"><meta property="og:image:type" content="${social.type}"><meta property="og:image:width" content="${size.width}"><meta property="og:image:height" content="${size.height}"><meta property="og:image:alt" content="${esc(social.alt)}">${article?.published?`<meta property="article:published_time" content="${article.published}">`:''}${article?.updated?`<meta property="article:modified_time" content="${article.updated}">`:''}${article?`<meta property="article:section" content="${esc(article.category)}">`:''}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(route.description)}"><meta name="twitter:image" content="${social.url}"><meta name="twitter:image:alt" content="${esc(social.alt)}">${structuredDataFor(route).map(jsonLd).join('')}`;
 await save(file,`<!doctype html><html lang="en"><head>${head}</head><body class="page-${route.type}">${renderPage(route,privacy)}<script type="module" src="/src/site/main.js"></script></body></html>`);
}

// Netlify serves a root 404.html with HTTP 404 for missing static paths.
// Include it in Vite's inputs so its stylesheet is bundled as on other pages.
await save('404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#071421"><title>Page not found · Orbit Aerials</title><meta name="description" content="This page could not be found. Explore Orbit Aerials’ drone services in Kuwait or contact our team."><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/src/site/site.css"></head><body class="page-not-found"><header class="site-header"><a class="brand" href="/" aria-label="Orbit Aerials home"><img src="/media/orbit-logo.png" width="900" height="273" alt="Orbit Aerials"></a></header><main id="main"><section class="page-intro wrap"><span class="eyebrow">404 / PAGE NOT FOUND</span><div><h1>Page not found.</h1><p>The link may have changed, or the address may be incomplete.</p><div class="actions"><a class="button" href="/">Back to home</a><a class="text-link" href="/services/">Explore our services</a><a class="text-link" href="/contact/">Contact Orbit</a></div></div></section></main></body></html>');
await save('pages-manifest.json',JSON.stringify([...routes.map(r=>(r.path==='/'?'':r.path.slice(1))+'index.html'),'404.html'],null,2)+'\n');
const sitemapRoutes=publicBuild?routes:[];
await save('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapRoutes.map(route=>{
 const article=articles.find(a=>a.path===route.path),lastmod=article?.updated||article?.published;
 return `<url><loc>${esc(canonicalUrl(route.path))}</loc>${lastmod?`<lastmod>${lastmod}</lastmod>`:''}</url>`;
}).join('')}</urlset>`);
// Allow crawlers to see the noindex tags and headers on previews. Disallow is
// not an indexing control and can hide noindex from crawlers.
await save('public/robots.txt','User-agent: *\nAllow: /\nDisallow: /api/\n'+(publicBuild?'Sitemap: '+canonicalUrl('/sitemap.xml')+'\n':''));
const noindexPaths=publicBuild?['/404.html','/design-concepts/*','/orbi-preview/*','/orbi/*']:['/*'];
await save('public/_headers',noindexPaths.map(path=>path+'\n  X-Robots-Tag: noindex, nofollow\n').join('\n'));
await save('public/_redirects','/image-credits.html /image-credits/ 301!\n/policy /privacy/ 301!\n/policy/ /privacy/ 301!\n/blog /journal/ 301\n/blog/ /journal/ 301\n/wwworbitaerialscomdrone-construction-insights /journal/ 301\n/wwworbitaerialscomdrone-construction-insights/ /journal/ 301\n');
const redirect=(to,title)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${canonicalUrl(to)}"><title>${title} · Orbit Aerials</title></head><body><a href="${to}">Continue to ${title}</a></body></html>`;
await save('public/image-credits.html',redirect('/image-credits/','Image credits'));
await save('public/policy/index.html',redirect('/privacy/','Privacy'));
for(const file of ['design-concepts/round-5/index.html','design-concepts/round-5/preview.html','design-concepts/round-6/index.html','design-concepts/round-6/preview.html','design-concepts/round-6/sources.html','public/orbi/preview.html']){
 let html=await readFile(resolve(sourceRoot,file),'utf8');
 html=html.replace(/<meta\b[^>]*name=["']robots["'][^>]*>/gi,'').replace(/[ \t]+$/gm,'');
 await save(file,html.replace(/<head>/i,'<head><meta name="robots" content="noindex,nofollow">'));
}
console.log(`Generated ${routes.length} complete HTML pages and a 404 document (${indexMode}).`);
