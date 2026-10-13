import {mountOrbiWidget} from '../orbi/orbi-widget.js';
import {createOrbiClient} from '../orbi/orbi-client.js';
import launcherStyles from '../../design-concepts/round-5/orbi-launcher.css?inline';
export function mountSiteOrbi(){
 const orbi=mountOrbiWidget({transport:createOrbiClient(),requestTimeout:35000});
 const root=orbi.element.shadowRoot,style=document.createElement('style');style.textContent=launcherStyles+'@media(max-width:540px){.orbi-launcher,.orbi-launcher:hover,.orbi-launcher__avatar{width:68px;height:68px;min-height:68px}}';root.append(style);
 orbi.element.style.setProperty('--orbi-font','Manrope, Arial, sans-serif');orbi.element.style.setProperty('--orbi-bottom','18px');
 root.querySelector('.orbi-mode').textContent='Connect with Orbi';root.querySelector('.orbi-welcome h3').innerHTML='What would you<br>like to see?';
 const prompts=[['Explore our industries','Explore industries'],['Meet our fleet','Tell me about our fleet'],['Find the right service','Explore services']];root.querySelectorAll('[data-prompt]').forEach((b,i)=>{b.dataset.prompt=prompts[i][1];b.firstChild.textContent=prompts[i][0]+' ';});
 document.addEventListener('orbit-motion',e=>orbi.setMotion(e.detail));
 document.addEventListener('orbit-viewer-open',()=>{orbi.close();orbi.setMotion(false);});document.addEventListener('orbit-viewer-close',()=>orbi.setMotion(!document.body.classList.contains('motion-paused')));
 const footer=document.querySelector('.site-footer');new IntersectionObserver(([entry])=>orbi.element.style.setProperty('--orbi-bottom',entry.isIntersecting?'85px':'18px')).observe(footer);
 addEventListener('pagehide',e=>{if(!e.persisted)orbi.destroy();});return orbi;
}
