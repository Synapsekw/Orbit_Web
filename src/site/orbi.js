import {mountOrbiWidget} from '../orbi/orbi-widget.js';
import {createOrbiClient} from '../orbi/orbi-client.js';
import launcherStyles from '../../design-concepts/round-5/orbi-launcher.css?inline';
export function mountSiteOrbi(){
 let pageMotionEnabled=!document.body.classList.contains('motion-paused'),viewerOpen=false;
 const orbi=mountOrbiWidget({transport:createOrbiClient(),requestTimeout:35000,motionAllowed:pageMotionEnabled});
 const root=orbi.element.shadowRoot,style=document.createElement('style');style.textContent=launcherStyles;root.append(style);
 orbi.element.style.setProperty('--orbi-font','Manrope, Arial, sans-serif');orbi.element.style.setProperty('--orbi-bottom','18px');
 root.querySelector('.orbi-mode').textContent='Connect with Orbi';root.querySelector('.orbi-welcome h3').innerHTML='What would you<br>like to see?';
 const prompts=[['Explore our industries','Explore industries'],['Meet our fleet','Tell me about our fleet'],['Find the right service','Explore services']];root.querySelectorAll('[data-prompt]').forEach((b,i)=>{b.dataset.prompt=prompts[i][1];b.firstChild.textContent=prompts[i][0]+' ';});
 const syncMotion=()=>orbi.setMotionAllowed(pageMotionEnabled&&!viewerOpen);
 document.addEventListener('orbit-motion',e=>{pageMotionEnabled=!!e.detail;syncMotion();});
 document.addEventListener('orbit-viewer-open',()=>{viewerOpen=true;orbi.close();syncMotion();});document.addEventListener('orbit-viewer-close',()=>{viewerOpen=false;syncMotion();});
 const footer=document.querySelector('.site-footer');new IntersectionObserver(([entry])=>orbi.element.style.setProperty('--orbi-bottom',entry.isIntersecting?'85px':'18px')).observe(footer);
 addEventListener('pagehide',e=>{if(!e.persisted)orbi.destroy();});return orbi;
}
