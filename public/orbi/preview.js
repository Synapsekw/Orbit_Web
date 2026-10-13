const moduleUrl = '/orbi/orbi.js?v=1.0.1';
const { createOrbiAvatar, mountOrbiWidget } = await import(/* @vite-ignore */ moduleUrl);
const renderMode = new URLSearchParams(location.search).has('artwork') ? 'artwork' : 'auto';
const hero = createOrbiAvatar(document.querySelector('#hero-avatar'), {renderMode});
const widget = mountOrbiWidget({renderMode});
window.orbiPreview = { hero, widget, createOrbiAvatar, mountOrbiWidget };
const descriptions = {
  idle:'Relaxed eyes, a small smile, and a gentle hover.',curious:'An inquisitive tilt and an attentive glance.',
  listening:'Eyes open a little wider, ready to hear more.',thinking:'A thoughtful look while Orbi considers a question.',
  speaking:'A subtle talking rhythm with a friendly expression.',happy:'A broad smile and softly curved eyes.',
  surprised:'A small lift, wide eyes, and a moment of discovery.',concerned:'A gentle, sympathetic expression when something needs attention.',
};
document.querySelectorAll('button[data-state]').forEach(button=>button.addEventListener('click',()=>{
  hero.setState(button.dataset.state);document.querySelector('#state-description').textContent=descriptions[button.dataset.state];
  document.querySelectorAll('button[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
}));
document.querySelectorAll('button[data-surface]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelector('.character-area').dataset.surface=button.dataset.surface;
  document.querySelectorAll('button[data-surface]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
}));
let paused=false;
const pause=document.querySelector('#pause');
pause.addEventListener('click',()=>{paused=!paused;hero.setMotion(!paused);widget.setMotion(!paused);pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Play motion ▷':'Pause motion Ⅱ';});
document.querySelector('#greet').addEventListener('click',()=>hero.playGesture());
document.querySelector('#open-widget').addEventListener('click',()=>widget.open());
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const status=document.querySelector('#render-status');
function updateStatus(){
  const info=hero.getStatus();
  status.textContent=info.renderer==='webgl'?(reduce.matches?'3D · Reduced motion':paused?'3D · Paused':'Interactive 3D · Transparent canvas'):'Transparent artwork fallback';
  pause.disabled=reduce.matches||renderMode==='artwork';document.querySelector('#greet').disabled=reduce.matches||paused||renderMode==='artwork';
}
updateStatus();const statusTimer=setInterval(updateStatus,750);
window.addEventListener('pagehide',()=>{clearInterval(statusTimer);hero.destroy();widget.destroy();},{once:true});
