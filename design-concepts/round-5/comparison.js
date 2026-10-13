import './comparison-dark.css';
import { getMode, initThemeControls, syncThemeLinks } from './theme.js';
import '@fontsource/manrope/300.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
const images={
  atlas:{home:new URL('./atlas-home.png',import.meta.url).href,services:new URL('./atlas-services.png',import.meta.url).href,about:new URL('./atlas-about.png',import.meta.url).href},
  gallery:{home:new URL('./gallery-home.png',import.meta.url).href,services:new URL('./gallery-services.png',import.meta.url).href,about:new URL('./gallery-about.png',import.meta.url).href},
  fieldwork:{home:new URL('./fieldwork-home.png',import.meta.url).href,services:new URL('./fieldwork-services.png',import.meta.url).href,about:new URL('./fieldwork-about.png',import.meta.url).href}
};
const darkImages={atlas:{home:new URL('./atlas-dark-home.png',import.meta.url).href,services:new URL('./atlas-dark-services.png',import.meta.url).href,about:new URL('./atlas-dark-about.png',import.meta.url).href},
gallery:{home:new URL('./gallery-dark-home.png',import.meta.url).href,services:new URL('./gallery-dark-services.png',import.meta.url).href,about:new URL('./gallery-dark-about.png',import.meta.url).href},
fieldwork:{home:new URL('./fieldwork-dark-home.png',import.meta.url).href,services:new URL('./fieldwork-dark-services.png',import.meta.url).href,about:new URL('./fieldwork-dark-about.png',import.meta.url).href}};
const screenshotFor=id=>(getMode()==='dark'?darkImages:images)[id][currentPage];
const studies=[
  {id:'atlas',number:'01',name:'Atlas',tag:'Bold clarity. Open space.',accent:'#876329',description:'The closest to your chosen direction. Staggered headings, a spacious site model and numbered service chapters create a strong architectural rhythm.'},
  {id:'gallery',number:'02',name:'Gallery',tag:'A quieter point of view.',accent:'#876329',description:'Lighter typography, inset spatial studies and generous photographic layouts. A calmer, more editorial reading experience from beginning to end.'},
  {id:'fieldwork',number:'03',name:'Fieldwork',tag:'A considered field guide.',accent:'#876329',description:'A permanent contents rail, precise annotations and structured visual chapters. The most technical expression, with an architectural field-guide feel.'}
];
const names={home:'Landing page',services:'Services',about:'About'};let currentPage='home';
const dialog=document.querySelector('dialog');
function showFull(id){const study=studies.find(s=>s.id===id);document.querySelector('#full-title').textContent=`${study.number} / ${study.name} — ${names[currentPage]}`;const image=document.querySelector('#full-image');image.src=screenshotFor(id);image.alt=`Complete ${names[currentPage]} for ${study.name}`;dialog.dataset.study=id;dialog.showModal();dialog.scrollTop=0;}
function render(){document.querySelector('#studies').innerHTML=studies.map(s=>`<article style="--accent:${s.accent}"><div class="study-head"><span>${s.number}</span><div><h2>${s.name}</h2><p>${s.tag}</p></div></div><button class="screenshot" data-full="${s.id}" aria-label="View full ${s.name} ${names[currentPage]}"><img src="${screenshotFor(s.id)}" alt="${s.name} ${names[currentPage]} screenshot"></button><p class="study-copy">${s.description}</p><div class="study-links"><a class="open-site" href="./preview.html?v=${s.id}&p=${currentPage}">Explore ${s.name} <span aria-hidden="true">↗</span></a><button class="full-page" data-full="${s.id}">View full page ↓</button></div></article>`).join('');document.querySelectorAll('[data-full]').forEach(button=>button.addEventListener('click',()=>showFull(button.dataset.full)));syncThemeLinks();}
document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{currentPage=button.dataset.page;document.querySelectorAll('[data-page]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
document.querySelector('#close-modal').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.addEventListener('orbit-theme-change',()=>{render();if(dialog.open)document.querySelector('#full-image').src=screenshotFor(dialog.dataset.study);});
initThemeControls();
