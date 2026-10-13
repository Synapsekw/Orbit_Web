import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadArticles,parseArticle} from '../scripts/journal.mjs';
import {articles} from '../src/site/journal.generated.js';
test('recovered posts retain original paths; prototype drafts stay out of routes and feeds',async()=>{
 const all=await loadArticles();assert.equal(all.filter(a=>a.status==='draft').length,3);assert.equal(articles.length,2);
 const sitemap=await readFile('public/sitemap.xml','utf8'),feed=await readFile('public/journal.xml','utf8');
 for(const a of all){if(a.status==='draft'){assert.ok(!sitemap.includes(a.slug));assert.ok(!feed.includes(a.slug));}else{assert.equal(a.originalUrl.replace(/\/$/,''),'https://www.orbitaerials.com'+a.path.slice(0,-1));assert.ok(a.html.length>1000);assert.ok(a.toc.length>=5);assert.ok(sitemap.includes(a.path));}}
 assert.match(await readFile('public/_redirects','utf8'),/wwworbitaerialscomdrone-construction-insights \/journal\/ 301/);
});
test('article authoring rejects invalid routes and renders script/unsafe links inert',async()=>{
 const source=await readFile('content/journal/drones-in-construction-industry.md','utf8');
 const result=parseArticle(source+'\n<script>alert(1)</script>\n\n[bad](javascript:alert)\n','test');assert.ok(!result.html.includes('<script>'));assert.ok(!result.html.includes('href="javascript:'));
 assert.throws(()=>parseArticle(source.replace('"/drones-in-construction-industry/"','"/../../private/"'),'test'),/invalid path/);
});
test('article SEO matches visible content and includes images, source links and a real update date',async()=>{
 for(const a of articles){
  const html=await readFile(a.path.slice(1)+'index.html','utf8');
  const structured=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const post=structured.find(s=>s['@type']==='BlogPosting');
  assert.equal(post.headline,a.title);assert.equal(post.dateModified,a.updated);assert.equal(post.mainEntityOfPage['@id'],'https://www.orbitaerials.com'+a.path);
  assert.equal(structured.find(s=>s['@type']==='BreadcrumbList').itemListElement.length,3);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.ok(html.includes('Updated 13 October 2026'));
  assert.equal((html.match(/class="article-figure"/g)||[]).length,2);
  assert.match(html,/<meta property="og:image" content="https:\/\/www.orbitaerials.com\/media\//);
  assert.ok(a.description.length<165);assert.ok(!a.html.includes('60-fold'));assert.ok(!a.html.includes('80% over budget'));
  assert.match(a.html,/href="\/services\//);assert.match(a.html,/href="https:\/\/enterprise-insights.dji.com\//);
 }
});
