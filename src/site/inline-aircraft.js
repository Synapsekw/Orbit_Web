import {mountElios} from './embedded-elios.js';
import {setAircraftState,syncAircraftState} from './aircraft-state.js';

export function mountLocalAircraft(host,{standalone=false}={}){
 const stage=host.querySelector('.aircraft-presentation'),started=new Set();let visible=!standalone;
 function failed(id){setAircraftState(stage,id,'error');if(stage.dataset.platform===id)host.querySelector('[data-platform-note]').textContent='3D is unavailable on this device. Aircraft reference shown.';}
 async function sync(){
  const id=stage.dataset.platform;const state=syncAircraftState(stage);if(state==='error'&&id!=='elios')failed(id);if(!visible||!['m400','m350'].includes(id)||started.has(id))return;
  started.add(id);
  setAircraftState(stage,id,'loading');
  try{
   const {mountM400}=await import('./m400-hero.js');
   const model=await mountM400(host,{id,name:id==='m400'?'DJI M400':'DJI M350 RTK',metadataUrl:id==='m400'?'/models/m400-flight.json':'/models/m350-cad.json',standalone,onReady:()=>setAircraftState(stage,id,'ready'),onError:()=>failed(id)});
   if(!model)failed(id);
  }catch{failed(id);}
 }
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(stage);
 const mutation=new MutationObserver(sync);mutation.observe(stage,{attributes:true,attributeFilter:['data-platform']});
 sync();
 addEventListener('pagehide',e=>{if(!e.persisted){observer.disconnect();mutation.disconnect();}},{once:true});
}

export function mountInlineAircraft(){
 document.querySelectorAll('[data-inline-aircraft]').forEach(host=>{
  if(host.dataset.inlineAircraft==='elios')mountElios(host,{standalone:true,view:host.dataset.aircraftView});
  else mountLocalAircraft(host,{standalone:true});
 });
}
