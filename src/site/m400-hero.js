import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {aircraftPose,scrollProgress} from './aircraft-motion.js';
import {advanceFlight,flightOffset,rotorAngle} from './m400-flight.js';

export async function mountM400(hero,{id='m400',name='DJI M400',metadataUrl='/models/m400-flight.json',standalone=false,onReady=()=>{},onError=()=>{}}={}){
 const stage=hero.querySelector('.aircraft-presentation'),target=document.createElement('div');
 target.className='m400-canvas';target.hidden=true;stage.append(target);
 let renderer;
 // Dense CAD lines make multisample resolves costly on software/mobile GPUs.
 // Keep the bounded high-DPI canvas, without the extra MSAA render targets.
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{target.remove();return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<600?1.25:1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const decoder=new DRACOLoader().setDecoderPath('/draco/'),loader=new GLTFLoader().setDRACOLoader(decoder);
 let gltf,metadata;const lineGeometries=[];
 try{
  const response=await fetch(metadataUrl);if(!response.ok)throw Error('Metadata unavailable');metadata=await response.json();
  // Settle every request before cleanup so a late decode cannot leak geometry.
  const results=await Promise.allSettled([
   loader.loadAsync(metadata.model).then(model=>gltf=model),
   ...metadata.parts.map(async part=>{
    const response=await fetch(part.edges);if(!response.ok)throw Error('Edges unavailable');
    const packed=new Uint16Array(await response.arrayBuffer()),positions=new Float32Array(packed.length);
    packed.forEach((v,i)=>{const [lo,hi]=part.bounds[i%3];positions[i]=lo+v/65535*(hi-lo);});
    const geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(positions,3));lineGeometries.push(geometry);part.geometry=geometry;
   })
  ]);
  if(results.some(r=>r.status==='rejected'))throw Error('Geometry unavailable');
  if(metadata.parts.filter(p=>p.axis).length!==4||metadata.parts.some(p=>!gltf.scene.getObjectByName(p.name)))throw Error('Incomplete aircraft');
 }catch{gltf?.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});lineGeometries.forEach(g=>g.dispose());renderer.dispose();target.remove();return null;}
 finally{decoder.dispose();}
 const scene=new THREE.Scene(),group=new THREE.Group(),model=gltf.scene;
 const bounds=metadata.framingBounds?new THREE.Box3(new THREE.Vector3(...metadata.framingBounds.map(b=>b[0])),new THREE.Vector3(...metadata.framingBounds.map(b=>b[1]))):new THREE.Box3().setFromObject(model);
 const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const normalization=4.7/Math.max(size.x,size.y,size.z),surfaceMaterial=new THREE.MeshBasicMaterial({color:0x071421,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,side:THREE.DoubleSide});
 const originals=new Set(),surfaceMeshes=[];model.traverse(o=>{if(o.isMesh){originals.add(o.material);o.material=surfaceMaterial;surfaceMeshes.push(o);}});originals.forEach(m=>m.dispose());
 // CAD feature edges provide the wireframe. Re-drawing every surface triangle
 // adds hundreds of thousands of redundant lines and stalls software GPUs.
 const lineMaterial=new THREE.LineBasicMaterial({color:0xd6b56d,transparent:true,opacity:.75}),rotors=[];
 metadata.parts.forEach(part=>{
  const node=model.getObjectByName(part.name);node.add(new THREE.LineSegments(part.geometry,lineMaterial));
  if(part.axis)rotors.push({node,axis:new THREE.Vector3(...part.axis).normalize(),direction:part.direction});
 });
 group.add(model);model.position.copy(center).negate();group.scale.setScalar(normalization);
 const pivot=new THREE.Group();pivot.add(group);scene.add(pivot);
 const camera=new THREE.PerspectiveCamera(33,1,.1,100);camera.position.set(0,.6,7);camera.lookAt(0,0,0);
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',name+' 3D wireframe. Drag horizontally to rotate. Arrow keys rotate, plus or minus zoom, Home resets.');canvas.style.touchAction='pan-y';target.append(canvas);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let selected=false,visible=true,modal=false,disposed=false,failed=false,frame=0,width=1,height=1,drag=null;
 let flight={aircraft:0,rotors:0},lastPaint=0,inspectUntil=0,scrollT=0,painted=false;
 const manual={yaw:0,pitch:0,scale:1};let current=aircraftPose(0,manual,false);
 function canAnimate(){return !reduced.matches&&!document.body.classList.contains('motion-paused');}
 function active(){return !disposed&&visible&&selected&&!document.hidden&&!modal;}
 function stop(){cancelAnimationFrame(frame);frame=0;lastPaint=0;}
 function schedule(){if(!active()){stop();return;}if(!frame)frame=requestAnimationFrame(draw);}
 function draw(stamp){
  frame=0;if(!active()){lastPaint=0;return;}
  const motion=canAnimate(),delta=lastPaint?(stamp-lastPaint)/1000:0;
  // Keep phone GPU work to 30 fps while retaining real elapsed-time animation.
  if(motion&&width<500&&lastPaint&&delta<1/30-.001){schedule();return;}
  lastPaint=stamp;flight=advanceFlight(flight,delta,motion,Boolean(drag)||stamp<inspectUntil);
  const rect=hero.getBoundingClientRect();if(motion&&!standalone)scrollT=scrollProgress(rect.top,rect.height);
  const pose=aircraftPose(scrollT,manual,true),offset=flightOffset(flight.aircraft);let moving=false;
  const ease=motion?1-Math.exp(-12*Math.min(delta||1/60,.05)):1;
  for(const key of Object.keys(pose)){const d=pose[key]-current[key];current[key]+=d*ease;if(Math.abs(d)>.0005)moving=true;}
  pivot.rotation.set(current.pitch+offset.pitch,current.yaw+offset.yaw,current.roll+offset.roll,'YXZ');pivot.scale.setScalar(current.scale);pivot.position.set(offset.x,offset.y,0);
  rotors.forEach(({node,axis,direction})=>node.quaternion.setFromAxisAngle(axis,rotorAngle(flight.rotors,direction)));
  renderer.render(scene,camera);if(!painted){painted=true;onReady();}if(motion||moving)schedule();
 }
 function resize(){const r=target.getBoundingClientRect();if(!r.width||!r.height)return;width=r.width;height=r.height;renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=width<500?8:7;camera.updateProjectionMatrix();schedule();}
 function action(a){inspectUntil=performance.now()+3000;if(a==='left')manual.yaw-=.2;if(a==='right')manual.yaw+=.2;if(a==='up')manual.pitch=Math.min(.9,manual.pitch+.12);if(a==='down')manual.pitch=Math.max(-.6,manual.pitch-.12);if(a==='in')manual.scale=Math.min(1.5,manual.scale+.1);if(a==='out')manual.scale=Math.max(.65,manual.scale-.1);if(a==='reset'){Object.assign(manual,{yaw:0,pitch:0,scale:1});flight.aircraft=0;}schedule();}
 const key=e=>{const a={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'in','=':'in','-':'out',Home:'reset'}[e.key];if(a){e.preventDefault();action(a);}};canvas.addEventListener('keydown',key);
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;manual.yaw+=(e.clientX-drag.x)*.009;drag.x=e.clientX;schedule();});
 const release=()=>{drag=null;inspectUntil=performance.now()+3000;canvas.classList.remove('is-dragging');};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
 const controls=hero.querySelector('.artwork-controls');const click=e=>{const button=e.target.closest('[data-art-action]');if(!button||!selected)return;e.stopImmediatePropagation();action(button.dataset.artAction);};controls.addEventListener('click',click,true);
 const note=hero.querySelector('[data-platform-note]');
 function select(){selected=stage.dataset.platform===id&&!failed;target.hidden=!selected;stage.classList.toggle('has-'+id+'-model',selected);if(selected){note.textContent=name+' · interactive CAD wireframe · drag to rotate';resize();}else stop();}
 const mutation=new MutationObserver(select);mutation.observe(stage,{attributes:true,attributeFilter:['data-platform']});
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(target);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();});observer.observe(stage);
 const modalOpen=()=>{modal=true;stop();},modalClose=()=>{modal=false;schedule();};
 addEventListener('scroll',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);document.addEventListener('orbit-motion',schedule);document.addEventListener('orbit-viewer-open',modalOpen);document.addEventListener('orbit-viewer-close',modalClose);reduced.addEventListener('change',schedule);
 function fallback(){failed=true;selected=false;stop();target.hidden=true;stage.classList.remove('has-'+id+'-model');onError();if(stage.dataset.platform===id)note.textContent='3D is unavailable on this device. Aircraft reference shown.';}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();});
 select();
 function destroy(){disposed=true;stop();mutation.disconnect();resizeObserver.disconnect();observer.disconnect();removeEventListener('scroll',schedule);document.removeEventListener('visibilitychange',schedule);document.removeEventListener('orbit-motion',schedule);document.removeEventListener('orbit-viewer-open',modalOpen);document.removeEventListener('orbit-viewer-close',modalClose);reduced.removeEventListener('change',schedule);controls.removeEventListener('click',click,true);surfaceMeshes.forEach(o=>o.geometry.dispose());surfaceMaterial.dispose();lineGeometries.forEach(g=>g.dispose());lineMaterial.dispose();renderer.dispose();target.remove();}
 addEventListener('pagehide',e=>{if(!e.persisted)destroy();},{once:true});
 return {destroy};
}
