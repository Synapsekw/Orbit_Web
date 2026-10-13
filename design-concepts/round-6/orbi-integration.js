import { mountOrbiWidget } from '../../src/orbi/orbi-widget.js';
import launcherStyles from '../round-5/orbi-launcher.css?inline';

export function mountConceptOrbi(){
  const link=(label,href)=>({label,href});
  const orbi=mountOrbiWidget({routes:{contact:'#contact'},resolveHref:href=>href.startsWith('#')?href:'#contact',disclosure:'Prepared service guidance. Messages stay in this page and are not sent.',respond:(message)=>{
    const text=String(message).toLowerCase();
    if(/elios|confined|tank|indoor|inside|ultrasonic|lidar/.test(text))return {reply:'Elios 3 is designed for confined-space and GPS-denied inspection. Its protected cage, visual and thermal imaging, and 3D context support difficult-to-access assets. Surveying and ultrasonic thickness work depend on the fitted payload and agreed inspection scope.',links:[link('Explore Elios 3','#elios'),link('Discuss your asset','#contact')]};
    if(/fleet|aircraft|dji|m350|m400|matrice/.test(text))return {reply:'Orbit operates DJI M350 and M400 aircraft for outdoor operations. Explore their roles alongside the Flyability Elios 3 confined-space inspection platform. The aircraft and payload are selected around your mission.',links:[link('Meet the aircraft','#fleet')]};
    if(/industry|industries|oil|gas|construction|power|security|environment/.test(text))return {reply:'Orbit works across oil and gas, construction, power, security, and the environment. Services combine inspection, mapping, monitoring, and confined-space access. Tell the team about your asset and the information you need.',links:[link('Explore the industries','#industries'),link('Discuss a mission','#contact')]};
    return {reply:'I can introduce Orbit’s industries, the DJI M350 and M400 fleet, or Elios 3 inspection capabilities. For a project scope, equipment configuration, or quotation, speak with the Orbit team.',links:[link('Explore capabilities','#capabilities'),link('Talk to Orbit','#contact')]};
  }});
  const root=orbi.element.shadowRoot,style=document.createElement('style');style.textContent=launcherStyles;root.append(style);
  orbi.element.style.setProperty('--orbi-bottom','75px');orbi.element.style.setProperty('--orbi-font','Manrope, Arial, sans-serif');
  root.querySelector('.orbi-mode').textContent='Local service guide';root.querySelector('.orbi-welcome h3').innerHTML='What’s your<br>next mission?';
  const prompts=[['Explore our industries','Tell me about your industries'],['Meet the aircraft','Tell me about the fleet'],['Inspect a confined space','Tell me about Elios 3']];
  root.querySelectorAll('[data-prompt]').forEach((b,i)=>{b.dataset.prompt=prompts[i][1];b.firstChild.textContent=prompts[i][0]+' ';});
  addEventListener('pagehide',e=>{if(!e.persisted)orbi.destroy();});
  return orbi;
}
