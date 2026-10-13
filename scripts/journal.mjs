import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {Marked} from 'marked';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parseArticle(source,filename){
 const match=source.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
 if(!match)throw new Error(filename+': expected JSON metadata between --- lines');
 const a=JSON.parse(match[1]);
 for(const key of ['slug','title','summary','category','author','image','alt','status'])if(typeof a[key]!=='string'||!a[key].trim())throw new Error(filename+': missing '+key);
 if(!/^[a-z0-9-]+$/.test(a.slug)||!['draft','published'].includes(a.status))throw new Error(filename+': invalid slug/status');
 if(a.path&&!/^\/[a-z0-9/-]+\/$/.test(a.path))throw new Error(filename+': invalid path');
 if(!/^[a-z0-9-]+$/.test(a.image))throw new Error(filename+': invalid image');
 for(const key of ['published','updated'])if(a[key]&&(!/^\d{4}-\d{2}-\d{2}$/.test(a[key])||Number.isNaN(Date.parse(a[key]))))throw new Error(filename+': invalid date');
 const toc=[];let headingIndex=0;
 const markdown=new Marked({renderer:{
  html({text}){return esc(text);},
  heading({tokens,depth}){const text=this.parser.parseInline(tokens),id='section-'+(++headingIndex);if(depth<=2)toc.push({title:text.replace(/<[^>]+>/g,''),id});return `<h${Math.max(2,depth)} id="${id}">${text}</h${Math.max(2,depth)}>`;},
  link({href,tokens}){const label=this.parser.parseInline(tokens);return /^(https:\/\/|\/(?!\/)|#)/.test(href)&&!/[\\\x00-\x20]/.test(href)?`<a href="${esc(href)}" rel="noreferrer">${label}</a>`:label;},
  image({href,text,title}){if(!/^\/media\/[a-z0-9-]+\.webp$/.test(href))return `<span>${esc(text)}</span>`;const base=href.slice(0,-5);return `<figure class="article-figure"><img src="${base}.avif" srcset="${base}-800.avif 800w, ${base}.avif 1600w" sizes="(max-width:700px) 90vw, 750px" width="1600" height="1000" alt="${esc(text)}" loading="lazy" decoding="async">${title?`<figcaption>${esc(title)} <a href="/image-credits/">Image credits</a></figcaption>`:''}</figure>`;},
  paragraph({tokens}){const body=this.parser.parseInline(tokens);return tokens.length===1&&tokens[0].type==='image'?body:`<p>${body}</p>`;},
  table({header,rows}){const cell=(c,tag)=>`<${tag}>${this.parser.parseInline(c.tokens)}</${tag}>`;return `<div class="article-table" tabindex="0" role="region" aria-label="Comparison table"><table><thead><tr>${header.map(c=>cell(c,'th')).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>cell(c,'td')).join('')}</tr>`).join('')}</tbody></table></div>`;}
 }});
 const html=markdown.parse(match[2]);
 return {...a,path:a.path||'/journal/'+a.slug+'/',minutes:a.minutes||Math.max(1,Math.ceil(match[2].split(/\s+/).length/220))+' min',html,toc};
}
export async function loadArticles(){
 const files=(await readdir('content/journal')).filter(f=>f.endsWith('.md')).sort();
 const all=await Promise.all(files.map(async f=>parseArticle(await readFile('content/journal/'+f,'utf8'),f)));
 const paths=new Set();for(const a of all){if(paths.has(a.path))throw new Error('Duplicate article path '+a.path);paths.add(a.path);}
 return all;
}
export async function buildJournal(){
 const articles=(await loadArticles()).filter(a=>a.status==='published').sort((a,b)=>(b.updated||b.published||'').localeCompare(a.updated||a.published||'')||(b.order||0)-(a.order||0));
 await mkdir('src/site',{recursive:true});
 await writeFile('src/site/journal.generated.js','// Generated from content/journal/*.md. Edit those files instead.\nexport const articles = '+JSON.stringify(articles,null,2)+';\n');
 await mkdir('public',{recursive:true});
 await writeFile('public/journal.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Orbit Journal</title><link>https://www.orbitaerials.com/journal/</link><description>Drone services, inspection and surveying insights from Orbit Aerials.</description>${articles.map(a=>`<item><title>${esc(a.title)}</title><link>https://www.orbitaerials.com${a.path}</link><guid>https://www.orbitaerials.com${a.path}</guid><description>${esc(a.summary)}</description>${a.published?'<pubDate>'+new Date(a.published).toUTCString()+'</pubDate>':''}</item>`).join('')}</channel></rss>`);
 console.log(`Prepared ${articles.length} published Journal articles.`);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/journal.mjs'))await buildJournal();
