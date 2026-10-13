import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createSiteModel } from './site-model.js';

export async function createViewer(container,{onReady,onError,onProgress,autoRotate=false,onAutoRotateChange,signal}={}) {
  if(signal?.aborted)return null;
  let renderer;
  try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'}); }
  catch(error){onError?.(error);return null;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
  renderer.setClearColor(0x191c21,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;
  renderer.autoClear=false;
  container.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-42,42,21,-21,.1,250);
  const homePosition=new THREE.Vector3(13,51,72),homeTarget=new THREE.Vector3(0,1.8,0);
  camera.position.copy(homePosition);
  const controls=new OrbitControls(camera,renderer.domElement);
  renderer.domElement.style.touchAction='pan-y';
  controls.target.copy(homeTarget);controls.enableDamping=true;controls.dampingFactor=.085;
  controls.enablePan=false;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI/2-.08;
  controls.minZoom=.7;controls.maxZoom=2.4;controls.rotateSpeed=.55;controls.zoomSpeed=.7;
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  controls.update();
  scene.add(new THREE.HemisphereLight(0xe8efff,0x706553,2));
  const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-25,40,20);scene.add(sun);
  let model,pendingAborted=false;
  const cancelPending=()=>{pendingAborted=true;controls.dispose();renderer.dispose();renderer.forceContextLoss();container.replaceChildren();};
  signal?.addEventListener('abort',cancelPending,{once:true});
  try { model=await createSiteModel({pointCount:window.innerWidth<650?80000:260000,onProgress}); }
  catch(error){if(!pendingAborted){controls.dispose();renderer.dispose();container.replaceChildren();onError?.(error);}return null;}
  finally{signal?.removeEventListener('abort',cancelPending);}
  if(pendingAborted||signal?.aborted){
    const geometries=new Set(),materials=new Set(),textures=new Set();
    for(const root of [model.photogrammetry,model.points,model.dsm])root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){materials.add(o.material);if(o.material.map)textures.add(o.material.map);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());return null;
  }
  scene.add(model.photogrammetry,model.points,model.dsm);
  model.points.visible=model.dsm.visible=false;
  let mode='points',reveal=32,width=1,height=1,frame=0,visible=true,disposed=false,failed=false;
  let remainingFrames=0,inFrame=false,lastTime=0,interacting=false,resumeAt=0,rotationSpeed=0;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReducedMotion=reducedMotion.matches;
  let rotationEnabled=autoRotate&&!prefersReducedMotion;
  const rotationAllowed=()=>rotationEnabled&&!prefersReducedMotion;
  function setRepresentation(which){model.photogrammetry.visible=which==='photo';model.points.visible=which==='points';model.dsm.visible=which==='dsm';}
  function render(){
    if(disposed||failed)return;
    renderer.setScissorTest(false);renderer.clear();
    if(mode==='photo'||reveal<=0){setRepresentation('photo');renderer.render(scene,camera);}
    else if(reveal>=100){setRepresentation(mode);renderer.render(scene,camera);}
    else {
      const cut=Math.round(width*(1-reveal/100));
      renderer.setScissorTest(true);
      renderer.setScissor(0,0,cut,height);setRepresentation('photo');renderer.render(scene,camera);
      renderer.setScissor(cut,0,width-cut,height);setRepresentation(mode);renderer.render(scene,camera);
      renderer.setScissorTest(false);
    }
  }
  function schedule(){if(!frame&&!inFrame&&visible&&!document.hidden&&!disposed&&!failed)frame=requestAnimationFrame(tick);}
  function tick(time){
    frame=0;if(disposed||!visible||document.hidden||failed){lastTime=0;return;}
    inFrame=true;
    const delta=lastTime?Math.min((time-lastTime)/1000,.05):1/60;lastTime=time;
    const turning=rotationAllowed()&&!interacting&&time>=resumeAt;
    // About one revolution every three minutes, easing into motion after interaction.
    rotationSpeed=turning?THREE.MathUtils.lerp(rotationSpeed,.32,1-Math.exp(-delta*2.5)):0;
    controls.autoRotate=rotationSpeed>.0001;controls.autoRotateSpeed=rotationSpeed;
    controls.update(delta);render();
    inFrame=false;
    if(--remainingFrames>0||rotationAllowed())schedule();
  }
  function invalidate(){remainingFrames=24;schedule();}
  function pauseForInteraction(){interacting=true;rotationSpeed=0;invalidate();}
  function endInteraction(){interacting=false;resumeAt=performance.now()+5000;invalidate();}
  function motionPreferenceChanged(event){prefersReducedMotion=event.matches;if(prefersReducedMotion)rotationEnabled=false;onAutoRotateChange?.(rotationAllowed());invalidate();}
  function visibilityChanged(){lastTime=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();}
  controls.addEventListener('start',pauseForInteraction);
  controls.addEventListener('end',endInteraction);
  reducedMotion.addEventListener('change',motionPreferenceChanged);
  document.addEventListener('visibilitychange',visibilityChanged);
  controls.addEventListener('change',invalidate);
  const resize=new ResizeObserver(()=>{
    const rect=container.getBoundingClientRect();width=Math.max(1,Math.round(rect.width));height=Math.max(1,Math.round(rect.height));
    renderer.setSize(width,height);const aspect=width/height;
    const viewWidth=Math.max(width<650?53:57,32*aspect),viewHeight=viewWidth/aspect;
    camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewHeight*.57;camera.bottom=-viewHeight*.43;
    camera.updateProjectionMatrix();invalidate();
  });resize.observe(container);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0;if(visible)invalidate();else{cancelAnimationFrame(frame);frame=0;}});observer.observe(container);
  function contextLost(event){event.preventDefault();failed=true;onError?.(new Error('WebGL context lost'));}
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  onReady?.();onAutoRotateChange?.(rotationAllowed());invalidate();
  return {
    setMode(value){mode=value;invalidate();},
    setReveal(value){reveal=THREE.MathUtils.clamp(Number(value)||0,0,100);invalidate();},
    setAutoRotate(value){rotationEnabled=Boolean(value);rotationSpeed=0;resumeAt=0;onAutoRotateChange?.(rotationAllowed());invalidate();},
    getAutoRotate:rotationAllowed,
    rotate(direction){resumeAt=performance.now()+5000;controls.autoRotate=false;const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),direction*Math.PI/12);camera.position.copy(controls.target).add(offset);controls.update();invalidate();},
    zoom(factor){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,controls.minZoom,controls.maxZoom);camera.updateProjectionMatrix();controls.update();invalidate();},
    reset(){resumeAt=performance.now()+5000;controls.autoRotate=false;camera.position.copy(homePosition);camera.zoom=1;camera.updateProjectionMatrix();controls.target.copy(homeTarget);controls.update();invalidate();},
    destroy(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();reducedMotion.removeEventListener('change',motionPreferenceChanged);document.removeEventListener('visibilitychange',visibilityChanged);controls.dispose();scene.traverse(object=>{object.geometry?.dispose();if(object.material){object.material.map?.dispose();object.material.dispose();}});renderer.dispose();container.replaceChildren();},
  };
}
