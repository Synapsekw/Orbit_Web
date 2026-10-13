import { mkdir, writeFile } from 'node:fs/promises';
import { services, articles } from '../src/content.js';
const pages=[
  ['','Clarity from above','Aerial documentation, spatial mapping and visual storytelling for the built world. Orbit Aerials, Kuwait.'],
  ['services','Our services','Construction progress, spatial mapping, 360 degree walkthroughs, time-lapse and handover films.'],
  ...services.map(s=>['services/'+s.slug,s.name,s.description]),
  ['about','About Orbit','A considered perspective on aerial capture, spatial understanding and visual storytelling.'],
  ['journal','The Orbit Journal','Ideas and useful perspectives on recording a changing world.'],
  ...articles.map(a=>['journal/'+a.slug,a.title,a.summary]),
  ['contact','Start a conversation','Talk about your construction project with Orbit Aerials in Kuwait.'],
  ['privacy','Privacy policy','How Orbit Aerials handles your information.'],
];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const [path,title,description] of pages){
  if(path)await mkdir(path,{recursive:true});
  await writeFile((path?path+'/':'')+'index.html',`<!doctype html>
<html lang="en" data-mode="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#07182b">
<script>try{const m=new URLSearchParams(location.search).get('mode');document.documentElement.dataset.mode=['light','dark'].includes(m)?m:localStorage.getItem('orbit-atlas-appearance')==='light'?'light':'dark';}catch{document.documentElement.dataset.mode='dark';}</script>
<style>html[data-mode=dark]{background:#07182b;color-scheme:dark}html[data-mode=light]{background:#fafaf7;color-scheme:light}</style>
<title>${escape(title)} · Orbit Aerials</title><meta name="description" content="${escape(description)}"><link rel="icon" href="/favicon.svg"><link rel="canonical" href="https://www.orbitaerials.com/${path?path+'/':''}"><meta property="og:title" content="${escape(title)} · Orbit Aerials"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"></head>
<body><div id="app"></div><noscript>Please enable JavaScript to explore Orbit Aerials. Contact info@orbitaerials.com or +965 991 11 397.</noscript><script type="module" src="/design-concepts/round-5/site.js"></script></body></html>`);
}
await writeFile('pages-manifest.json',JSON.stringify(pages.map(([p])=>(p?p+'/':'')+'index.html'),null,2)+'\n');
console.log(`Built ${pages.length} Atlas pages.`);
