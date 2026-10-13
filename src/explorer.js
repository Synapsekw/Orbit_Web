import { createViewer } from './viewer.js';

const $=selector=>document.querySelector(selector);
const modes={
  photo:{label:'Photogrammetry',title:'The site, as you see it.',copy:'A textured 3D representation of the build, ready to explore from every angle.'},
  points:{label:'Point cloud',title:'A different kind of detail.',copy:'A cloud of surface points, revealing the geometry behind the image.'},
  dsm:{label:'DSM',title:'See how the surface takes shape.',copy:'A digital surface model showing the height of the ground, structures, and vegetation.'},
};
let currentMode='points',viewer;
const range=$('#reveal'),guide=$('.compare-guide');
function updateReveal(){
  const value=Number(range.value);
  range.style.setProperty('--fill',`${value}%`);
  $('#reveal-value').value=currentMode==='photo'?'Full color':`${value}%`;
  guide.style.left=`${100-value}%`;
  guide.hidden=currentMode==='photo'||value===0||value===100;
  viewer?.setReveal(value);
}
function setMode(mode){
  currentMode=mode;
  for(const button of document.querySelectorAll('[data-mode]'))button.setAttribute('aria-pressed',String(button.dataset.mode===mode));
  $('#view-title').textContent=modes[mode].title;
  $('#view-copy').textContent=modes[mode].copy;
  range.disabled=mode==='photo';
  $('.reveal-control').classList.toggle('inactive',mode==='photo');
  const label=mode==='photo'?'Textured model':`Reveal ${modes[mode].label.toLowerCase()}`;
  $('.range-title label').textContent=label;range.setAttribute('aria-label',label);
  $('#layer-label').textContent=mode==='photo'?'Full color':modes[mode].label;
  $('.height-key').hidden=mode!=='dsm';
  viewer?.setMode(mode);updateReveal();
}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
range.addEventListener('input',updateReveal);
$('#reset-view').addEventListener('click',()=>viewer?.reset());
$('#rotate-left').addEventListener('click',()=>viewer?.rotate(-1));
$('#rotate-right').addEventListener('click',()=>viewer?.rotate(1));
$('#zoom-in').addEventListener('click',()=>viewer?.zoom(1.15));
$('#zoom-out').addEventListener('click',()=>viewer?.zoom(1/1.15));
function showError(error){
  console.error('3D viewer unavailable:',error);
  $('.scene-loading').hidden=true;$('#scene-fallback').hidden=false;
  guide.hidden=true;
  document.querySelectorAll('[data-mode],.scene-actions button,#reveal').forEach(el=>el.disabled=true);
}
// Paint the layout before loading and preparing the captured site.
requestAnimationFrame(()=>setTimeout(async()=>{
  try {
    viewer=await createViewer($('#scene'),{onReady:()=>{$('.scene-loading').hidden=true;},onError:showError,onProgress:message=>{$('#loading-copy').textContent=message;}});
    if(viewer)setMode(currentMode);
  } catch(error){showError(error);}
},20));
if(import.meta.hot)import.meta.hot.dispose(()=>viewer?.destroy());
