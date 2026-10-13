import {mountElios} from './embedded-elios.js';

export function mountLocalAircraft(host,{standalone=false}={}){
 const stage=host.querySelector('.aircraft-presentation'),started=new Set();let visible=false;
 async function sync(){
  const id=stage.dataset.platform;if(!visible||!['m400','m350'].includes(id)||started.has(id))return;
  started.add(id);
  try{
   const {mountM400}=await import('./m400-hero.js');
   await mountM400(host,{id,name:id==='m400'?'DJI M400':'DJI M350 RTK',metadataUrl:id==='m400'?'/models/m400-flight.json':'/models/m350-cad.json',standalone});
  }catch{/* The manufacturer artwork remains available on failure. */}
 }
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(stage);
 const mutation=new MutationObserver(sync);mutation.observe(stage,{attributes:true,attributeFilter:['data-platform']});
 addEventListener('pagehide',e=>{if(!e.persisted){observer.disconnect();mutation.disconnect();}},{once:true});
}

export function mountInlineAircraft(){
 document.querySelectorAll('[data-inline-aircraft]').forEach(host=>{
  if(host.dataset.inlineAircraft==='elios')mountElios(host,{standalone:true,view:host.dataset.aircraftView});
  else mountLocalAircraft(host,{standalone:true});
 });
}
