import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {routes,fleet} from '../src/site/data.js';
const read=path=>readFile(path==='/'?'index.html':path.slice(1)+'index.html','utf8');
test('all website pages ship meaningful HTML, metadata and preserved employee access',async()=>{
 assert.equal(routes.length,20);
 for(const route of routes){const html=await read(route.path);assert.match(html,/<h1[^>]*>.+?<\/h1>/s,route.path);assert.match(html,/name="description" content="[^"]+"/);assert.ok(html.includes('https://www.orbitaerials.com'+route.path));assert.match(html,/property="og:image"/);assert.match(html,/https:\/\/www.orbitaerials.com\/log-in/);assert.doesNotMatch(html,/class="review-bar"|id="app"><\/div>/);}
});
test('local links and anchors resolve without relying on client routing',async()=>{
 for(const route of routes){const html=await read(route.path);for(const [,raw] of html.matchAll(/<a[^>]*href="([^" ]+)"/g)){const href=raw.replaceAll('&amp;','&');if(!href.startsWith('/')&&!href.startsWith('#'))continue;const url=new URL(href,'https://www.orbitaerials.com'+route.path);const target=routes.find(r=>r.path===url.pathname);if(target){if(url.hash){const page=await read(target.path);assert.ok(page.includes(`id="${url.hash.slice(1)}"`),`${route.path}: missing ${href}`);}}else{await access('public'+url.pathname).catch(()=>assert.fail(`${route.path}: missing ${href}`));}}}
});
test('all HTML images have local files, alt text and reserved dimensions',async()=>{
 for(const route of routes){const html=await read(route.path);for(const [tag] of html.matchAll(/<img\b[^>]+>/g)){assert.match(tag,/alt="[^"]*"/);assert.match(tag,/width="\d+"/);assert.match(tag,/height="\d+"/);const src=tag.match(/src="([^"]+)"/)[1];await access('public'+src);}}
});
test('M400 cannot open a mislabeled M350 viewer and fleet claims reflect owner confirmation',()=>{
 assert.equal(fleet.find(f=>f.id==='m400').model,null);assert.notEqual(fleet.find(f=>f.id==='m350').model,fleet.find(f=>f.id==='elios').model);
});
test('privacy source meaning is preserved verbatim and optional external viewer disclosed',async()=>{
 const policy=await readFile('src/privacy-content.html','utf8'),html=await read('/privacy/');assert.ok(html.includes(policy));assert.match(html,/Sketchfab/);assert.match(html,/Nothing is sent to Orbit/);
});
test('form cannot accidentally GET personal details before enhancement',async()=>{
 const html=await read('/contact/');assert.match(html,/<button[^>]*disabled[^>]*type="submit"/);assert.match(html,/Nothing has been sent yet/);
});
