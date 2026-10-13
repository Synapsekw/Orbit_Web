import {fleet} from './data.js';
import {initEnquiry} from './enquiry.js';
import {mountElios} from './embedded-elios.js';
import {mountLocalAircraft,mountInlineAircraft} from './inline-aircraft.js';
if(new URLSearchParams(location.search).get('diagnostics')==='1')import('./diagnostics.js').then(m=>m.showDiagnostics());
document.documentElement.classList.add('js');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#site-nav');
const closeMenu=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
initEnquiry();

const panels=document.querySelector('.industry-panels');
if(panels){panels.classList.add('enhanced');const select=id=>{document.querySelectorAll('[data-industry-panel]').forEach(p=>p.hidden=p.dataset.industryPanel!==id);document.querySelectorAll('[data-industry]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.industry===id)));};select('oil-gas');document.querySelectorAll('[data-industry]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.industry)));}

const hero=document.querySelector('.aircraft-hero');
let paused=media.matches;
const applyMotion=()=>{document.body.classList.toggle('motion-paused',paused||media.matches);document.querySelectorAll('button[data-motion]').forEach(b=>{b.setAttribute('aria-pressed',String(paused||media.matches));b.textContent=media.matches?'Motion reduced':paused?'Resume motion':'Pause motion';b.disabled=media.matches;});document.dispatchEvent(new CustomEvent('orbit-motion',{detail:!paused&&!media.matches}));};
media.addEventListener('change',()=>{paused=media.matches;applyMotion();});
document.querySelectorAll('button[data-motion]').forEach(b=>b.addEventListener('click',()=>{paused=!paused;applyMotion();}));applyMotion();
if(hero){
 mountElios(hero);
 mountLocalAircraft(hero);
 new IntersectionObserver(([entry])=>document.body.classList.toggle('hero-in-view',entry.isIntersecting)).observe(hero);
 const stage=hero.querySelector('.aircraft-presentation'),tilt=hero.querySelector('.aircraft-tilt'),image=hero.querySelector('.aircraft-image');let turn=-10,scale=1,x=0,y=0,raf=0;
 const update=()=>{tilt.style.setProperty('--turn',turn+'deg');tilt.style.setProperty('--scale',scale);tilt.style.setProperty('--tilt-x',x+'deg');tilt.style.setProperty('--tilt-y',y+'deg');};
 const reset=()=>{turn=-10;scale=1;x=y=0;update();};
 const act=action=>{if(action==='left')turn=Math.max(-35,turn-5);if(action==='right')turn=Math.min(35,turn+5);if(action==='in')scale=Math.min(1.25,scale+.05);if(action==='out')scale=Math.max(.7,scale-.05);if(action==='reset')reset();update();};
 hero.querySelectorAll('[data-art-action]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.artAction)));
 tilt.addEventListener('keydown',e=>{const action={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'in',ArrowDown:'out','+':'in','=':'in','-':'out',Home:'reset'}[e.key];if(action){e.preventDefault();act(action);}});
 tilt.addEventListener('pointermove',e=>{if(paused||media.matches||e.pointerType==='touch'||raf)return;raf=requestAnimationFrame(()=>{const r=tilt.getBoundingClientRect();x=(e.clientX-r.left-r.width/2)/r.width*14;y=-(e.clientY-r.top-r.height/2)/r.height*8;update();raf=0;});});
 tilt.addEventListener('pointerleave',()=>{x=y=0;update();});
 const setPlatform=id=>{const f=fleet.find(f=>f.id===id);if(!f)return;stage.dataset.platform=f.id;image.src='/media/'+f.image+'.webp';image.alt=f.name;image.classList.toggle('elios-image',id==='elios');hero.querySelectorAll('[data-platform-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platformSelect===id)));for(const [key,value] of [['name',f.name],['tag',f.eyebrow],['copy',f.description],['applications',f.applications.join(' · ')]])hero.querySelector('[data-platform-'+key+']').textContent=value;const a=hero.querySelector('.platform-link');a.href=f.source;a.innerHTML='Explore '+f.short+' <span aria-hidden="true">↗</span>';hero.querySelector('[data-platform-note]').textContent='Interactive product artwork · perspective and scale controls';reset();};
 hero.querySelectorAll('[data-platform-select]').forEach(b=>b.addEventListener('click',()=>setPlatform(b.dataset.platformSelect)));
 let stageVisible=true,pointerActive=false,focusActive=false;
 const syncHover=()=>{hero.querySelector('.aircraft-position').style.animationPlayState=stageVisible&&!document.hidden&&!paused&&!media.matches&&!pointerActive&&!focusActive?'running':'paused';};
 stage.addEventListener('pointerenter',()=>{pointerActive=true;syncHover();});
 stage.addEventListener('pointerleave',()=>{pointerActive=false;syncHover();});
 stage.addEventListener('focusin',()=>{focusActive=true;syncHover();});
 stage.addEventListener('focusout',e=>{focusActive=stage.contains(e.relatedTarget);syncHover();});
 const observer=new IntersectionObserver(([entry])=>{stageVisible=entry.isIntersecting;syncHover();});observer.observe(stage);
 document.addEventListener('orbit-motion',syncHover);
 document.addEventListener('visibilitychange',syncHover);
}

mountInlineAircraft();

// Below-the-fold reveals are an enhancement; content is never hidden until observed.
if(!media.matches&&'IntersectionObserver' in window){const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target);}}),{threshold:.06});document.querySelectorAll('.section-heading,.about-values article,.process-list li').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-ready');reveal.observe(el);}});}

let viewerModule;
document.addEventListener('click',async e=>{const button=e.target.closest('[data-viewer]');if(!button)return;button.disabled=true;try{viewerModule ||= import('./viewers.js');const {openViewer}=await viewerModule;button.disabled=false;await openViewer(button.dataset.viewer,button);}catch{button.insertAdjacentHTML('afterend','<p class="asset-note" role="status">The interactive viewer could not load. The image and service information remain available.</p>');}finally{button.disabled=false;}});

let orbiPromise;
const staticOrbi=document.querySelector('.orbi-static');
const loadOrbi=()=>orbiPromise ||= import('./orbi.js').then(({mountSiteOrbi})=>{const guide=mountSiteOrbi();staticOrbi.hidden=true;return guide;}).catch(()=>{orbiPromise=null;return null;});
staticOrbi.addEventListener('click',async()=>{const guide=await loadOrbi();if(guide)guide.open();else location.href='/services/';});
// Keep the initial view light; reduced-data devices retain the real static character.
if(!navigator.connection?.saveData){const start=()=>{if(document.body.classList.contains('page-contact')&&innerWidth<541)return;loadOrbi();};if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:4500});else setTimeout(start,2200);}

// Hide failed decorative media while retaining its descriptive fallback.
document.querySelectorAll('main img').forEach(image=>image.addEventListener('error',()=>{if(image.getAttribute('src')?.endsWith('.avif')&&!image.dataset.fallback){image.dataset.fallback='true';image.removeAttribute('srcset');image.src=image.getAttribute('src').replace('.avif','.webp');return;}image.classList.add('media-failed');if(image.alt){const fallback=document.createElement('span');fallback.className='media-fallback';fallback.textContent=image.alt;image.after(fallback);}}));
