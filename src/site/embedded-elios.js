import {loadSketchfab,styleEliosWireframe} from './sketchfab-aircraft.js';
import {orbitCamera} from './embedded-aircraft-camera.js';
import {scrollProgress} from './aircraft-motion.js';

const MODEL='309440e0ee9041b7b264a24898f0f8d6';
const views={hero:{zoom:1.06},profile:{yaw:.85,pitch:.04,zoom:1.04},elevated:{yaw:-.65,pitch:.4,zoom:1.1},'three-quarter':{yaw:-.4,pitch:.15,zoom:1.07}};
let instance=0;

// Flyability's geometry remains inside its authorized embed; it is not copied.
export function mountElios(host,{standalone=false,view='hero'}={}){
 const stage=host.querySelector('.aircraft-presentation'),note=host.querySelector('[data-platform-note]');
 const controls=host.querySelector('.artwork-controls'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const target=document.createElement('div');target.className='elios-canvas';target.hidden=true;stage.append(target);
 const viewport=document.createElement('div');viewport.className='elios-viewport';target.append(viewport);
 const status=document.createElement('div');status.className='aircraft-load-status';status.setAttribute('role','status');target.append(status);
 const retry=document.createElement('button');retry.className='text-link aircraft-retry';retry.type='button';retry.textContent='Retry model';retry.hidden=true;target.append(retry);
 let api,frame,home,framing=1,ready=false,loading=false,failed=false,selected=false,visible=false,modal=false,disposed=false,request=0,timer=0,raf=0,running=false,busy=false,lastTime=0,holdUntil=0,lastProgress=0;
 // Compensate for the extra iframe height outside the visible crop.
 const frameScale=()=>target.clientHeight&&frame?frame.clientHeight/target.clientHeight:1;
 function credit(){
  const maker=document.createElement('a');maker.href='https://www.flyability.com/elios-3';maker.textContent='Flyability';
  const provider=document.createElement('a');provider.href=`https://sketchfab.com/3d-models/${MODEL}`;provider.textContent='Sketchfab';
  for(const link of [maker,provider]){link.target='_blank';link.rel='noreferrer';}
  note.replaceChildren('Elios 3 · Drag to rotate · Model by ',maker,' on ',provider);
 }
 function resize(){
  if(!ready||!selected||!target.clientHeight)return;
  const next=frameScale(),ratio=next/framing;if(Math.abs(ratio-1)<.001)return;
  framing=next;home=orbitCamera(home,{zoom:ratio});
  const token=request;
  api.getCameraLookAt((error,camera)=>{if(error||token!==request||disposed)return;const pose=orbitCamera(camera,{zoom:ratio});api.setCameraLookAt(pose.position,pose.target,0);});
 }
 const progress=()=>{const r=host.getBoundingClientRect();return standalone?0:scrollProgress(r.top,r.height);};
 const motion=()=>!reduced.matches&&!document.body.classList.contains('motion-paused');
 const active=()=>ready&&selected&&visible&&!document.hidden&&!modal&&!disposed;
 function stopClock(){cancelAnimationFrame(raf);raf=0;lastTime=0;}
 function schedule(){if(!active()||!motion()){stopClock();return;}if(!raf)raf=requestAnimationFrame(tick);}
 function tick(time){
  raf=0;if(!active()||!motion()){lastTime=0;return;}
  if(!lastTime)lastTime=time;
  if(time-lastTime<85||busy){schedule();return;}
  const dt=Math.min(.16,(time-lastTime)/1000);lastTime=time;
  if(document.activeElement===frame||time<holdUntil){lastProgress=progress();schedule();return;}
  const next=progress(),yaw=dt*.07+(next-lastProgress)*.8;lastProgress=next;busy=true;
  api.getCameraLookAt((error,camera)=>{
   busy=false;if(error||!active()||!motion())return;
   const pose=orbitCamera(camera,{yaw});api.setCameraLookAt(pose.position,pose.target,.1);
  });schedule();
 }
 function sync(){
  if(disposed)return;
  selected=stage.dataset.platform==='elios';
  target.hidden=!selected;target.classList.toggle('is-loading',!ready);
  stage.classList.toggle('has-elios-model',selected&&ready);stage.classList.toggle('elios-loading',selected&&!ready&&!failed);
  status.hidden=ready;retry.hidden=!failed;status.textContent=failed?'The model is temporarily unavailable.':'Preparing Elios 3…';
  if(selected){if(ready)credit();else note.textContent=failed?'Explore Elios 3 on Flyability’s website, or retry the model.':'Loading the official Flyability model…';}
  const next=active();if(api&&ready&&next!==running){running=next;next?api.start():api.stop();}
  schedule();
  if(selected&&visible&&!document.hidden&&!modal&&!ready&&!loading&&!failed)start();
 }
 function fail(token){
  if(token!==request||disposed)return;
  request++;clearTimeout(timer);stopClock();loading=false;ready=false;failed=true;running=false;busy=false;
  api?.stop();api=null;frame?.remove();frame=null;sync();
 }
 async function start(){
  if(loading||ready||disposed)return;
  const token=++request;loading=true;failed=false;sync();
  frame=document.createElement('iframe');frame.id='elios-inline-'+(++instance);frame.title='Flyability Elios 3 interactive wireframe';frame.allow='autoplay; fullscreen';frame.allowFullscreen=true;frame.tabIndex=-1;viewport.append(frame);
  timer=setTimeout(()=>fail(token),60000);
  try{
   const Sketchfab=await loadSketchfab();if(token!==request||disposed)return;
   // The crop keeps peripheral provider controls outside the presentation.
   // Attribution remains visible in Orbit's caption; native dragging stays available.
   new Sketchfab('1.12.1',frame).init(MODEL,{autostart:1,camera:0,animation_autoplay:0,annotations_visible:0,annotation_tooltip_visible:0,ui_stop:0,ui_theme:'dark',dnt:1,wireframe_preload:1,success(value){
    if(token!==request||disposed){value.stop();return;}api=value;
    api.addEventListener('viewerready',async()=>{
     if(token!==request||disposed)return;
     try{
      await styleEliosWireframe(api);if(token!==request||disposed)return;
      // Remove the manufacturer's payload tour from this viewer session only.
      // This does not edit the published model or affect its attribution.
      api.removeAllAnnotations(()=>{});
      // Short continuous orbit updates must not restart Sketchfab's default
      // ease-out curve: that repeatedly brakes the camera and visibly pulses.
      api.setCameraEasing('easeLinear');
      api.getCameraLookAt((error,camera)=>{
       if(token!==request||disposed)return;if(error){fail(token);return;}
       framing=frameScale();const preset=views[view]||views.hero;
       home=orbitCamera(camera,{...preset,zoom:preset.zoom*framing});api.setCameraLookAt(home.position,home.target,0);
       clearTimeout(timer);ready=true;loading=false;running=true;lastProgress=progress();sync();
      });
     }catch{fail(token);}
    });
   },error:()=>fail(token)});
  }catch{fail(token);}
 }
 function move(action,instant=false){
  if(!active()||busy)return;holdUntil=performance.now()+3500;lastProgress=progress();
  if(action==='reset'){api.setCameraLookAt(home.position,home.target,instant||!motion()?0:.25);return;}
  busy=true;api.getCameraLookAt((error,camera)=>{
   busy=false;if(error||!active())return;
   const pose=orbitCamera(camera,{yaw:action==='left'?-.22:action==='right'?.22:0,zoom:action==='in'?.87:action==='out'?1.15:1});
   const distance=Math.hypot(...pose.position.map((v,i)=>v-pose.target[i])),original=Math.hypot(...home.position.map((v,i)=>v-home.target[i]));
   if(distance<original*.45||distance>original*2.2)return;
   api.setCameraLookAt(pose.position,pose.target,instant||!motion()?0:.22);
  });
 }
 const click=e=>{const b=e.target.closest('[data-art-action]');if(!b||!selected)return;e.stopImmediatePropagation();move(b.dataset.artAction,e.detail===0);};
 const keys=e=>{const action={ArrowLeft:'left',ArrowRight:'right','+':'in','=':'in','-':'out',Home:'reset'}[e.key];if(action&&active()){e.preventDefault();move(action,true);}};
 const motionChanged=()=>{lastProgress=progress();schedule();},opened=()=>{modal=true;sync();},closed=()=>{modal=false;sync();};
 retry.addEventListener('click',()=>{failed=false;start();});controls.addEventListener('click',click,true);controls.addEventListener('keydown',keys);
 const mutation=new MutationObserver(sync);mutation.observe(stage,{attributes:true,attributeFilter:['data-platform']});
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(stage);
 const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(target);
 document.addEventListener('visibilitychange',sync);document.addEventListener('orbit-motion',motionChanged);document.addEventListener('orbit-viewer-open',opened);document.addEventListener('orbit-viewer-close',closed);reduced.addEventListener('change',motionChanged);sync();
 function destroy(){disposed=true;request++;clearTimeout(timer);stopClock();api?.stop();frame?.remove();target.remove();mutation.disconnect();observer.disconnect();sizeObserver.disconnect();controls.removeEventListener('click',click,true);controls.removeEventListener('keydown',keys);document.removeEventListener('visibilitychange',sync);document.removeEventListener('orbit-motion',motionChanged);document.removeEventListener('orbit-viewer-open',opened);document.removeEventListener('orbit-viewer-close',closed);reduced.removeEventListener('change',motionChanged);}
 addEventListener('pagehide',e=>{if(!e.persisted)destroy();},{once:true});
 return {destroy};
}
