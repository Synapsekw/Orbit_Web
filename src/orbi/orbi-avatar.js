import * as THREE from 'three';
import { createOrbiModel } from './orbi-model.js';
import { sampleExpression, sampleLauncherMotion, ORBI_STATES } from './orbi-motion.js';
import { loadOrbiEnvironment } from './orbi-environment.js';

const instances = new WeakMap();

/** Mount in a sized element. Call destroy() before removing the host. */
export function createOrbiAvatar(element, options = {}) {
  if (!(element instanceof HTMLElement)) throw new TypeError('Orbi needs an HTML element.');
  if (instances.has(element)) return instances.get(element);
  const { compact = false, interactive = true, playful = false, fallbackUrl = '/orbi/orbi-fallback.webp', environmentUrl = '/orbi/orbi-studio-cubeuv.png', motion = true, renderMode = 'auto' } = options;
  const wrapper = document.createElement('span'); wrapper.className = 'orbi-avatar'; wrapper.setAttribute('aria-hidden','true');
  const img = document.createElement('img'); img.className = 'orbi-avatar__fallback'; img.src = fallbackUrl; img.alt = ''; img.decoding = 'async'; img.draggable = false;
  const canvas = document.createElement('canvas'); canvas.className = 'orbi-avatar__canvas';
  const shadow = playful ? document.createElement('span') : null;
  if (shadow) { shadow.className = 'orbi-avatar__shadow'; shadow.setAttribute('aria-hidden','true'); element.append(shadow); }
  wrapper.append(img); element.append(wrapper);
  let state = 'idle', destroyed = false, enabled = !!motion, manuallyVisible = true, inViewport = false, held = false;
  let renderer, model, environment, resizeObserver, intersectionObserver, scene, camera;
  let width = 0, height = 0, frame = 0, frames = 0, last = null, time = 0, lost = false, ready = false;
  let preparation = 0;
  let nextDraw = null, drawElapsed = 0;
  const frameInterval = compact ? 1000 / 30 : 0;
  let mouseX = 0, mouseY = 0, lookX = 0, lookY = 0, gestureTime = -1;
  let pose = sampleExpression(state,0,false);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), removers = [];
  let reducedMotion = reduced.matches;
  const listen = (target,event,handler) => { target.addEventListener(event,handler); removers.push(() => target.removeEventListener(event,handler)); };
  const animated = () => enabled && !reducedMotion;
  const visible = () => manuallyVisible && inViewport && !document.hidden;
  const running = () => !destroyed && !held && (playful || (!lost && ready && renderer)) && visible() && width > 0 && height > 0 && animated();
  function draw(dt = 1, moving = false) {
    if (destroyed || !width || !height) return;
    const choreography = sampleLauncherMotion(time,playful && moving);
    if (playful) {
      // Move only the artwork. The button and its focus ring never chase Orbi.
      const roll = choreography.roll + ((!renderer || !ready || lost) ? choreography.yaw*180/Math.PI : 0);
      wrapper.style.transform = `translate3d(${choreography.x}%,${choreography.y}%,0) rotate(${roll}deg) scale(${choreography.scaleX},${choreography.scaleY})`;
      shadow.style.transform = `scale(${choreography.shadowScale})`;
      shadow.style.opacity = choreography.shadowOpacity;
    }
    if (!renderer || !ready || lost) { frames++; return; }
    const target = sampleExpression(state,time,moving);
    const ease = moving ? 1 - Math.exp(-dt * 10) : 1;
    for (const key in pose) pose[key] += (target[key] - pose[key]) * ease;
    lookX += ((moving ? mouseX : 0) - lookX) * ease; lookY += ((moving ? mouseY : 0) - lookY) * ease;
    let lift = 0;
    if (moving && gestureTime >= 0) { gestureTime += dt; lift = Math.sin(Math.min(1,gestureTime/1.2)*Math.PI)*.14; if (gestureTime >= 1.2) gestureTime = -1; }
    model.update(pose,time,moving,lookX,lookY,lift,choreography.yaw);
    renderer.render(scene,camera); frames++;
    wrapper.dataset.renderer = 'webgl';
  }
  function tick(now) {
    frame = 0; if (!running()) return;
    // Advance by active wall time even when a slow device misses frames. Only
    // rendering is capped; the full turn and eighteen-second loop keep pace.
    const dt = last === null ? 1/60 : Math.max(0,(now-last)/1000); last = now;
    time += dt; drawElapsed += dt;
    if (nextDraw === null) nextDraw = now;
    if (!frameInterval || now + .001 >= nextDraw) {
      draw(drawElapsed,true); drawElapsed = 0;
      if (frameInterval) nextDraw += Math.max(1,Math.floor((now-nextDraw+.001)/frameInterval)+1) * frameInterval;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = null; nextDraw = null; drawElapsed = 0;
    if (destroyed) return;
    wrapper.dataset.motion = running() ? 'running' : 'paused';
    if (running()) frame = requestAnimationFrame(tick);
    else if (visible() && !held) draw();
  }
  function resize() {
    if (destroyed) return;
    const rect = element.getBoundingClientRect(); width = Math.round(rect.width); height = Math.round(rect.height);
    if (renderer && width && height) {
      renderer.setSize(width,height,false); camera.aspect = width/height;
      camera.position.z = 6.35 * Math.max(1,1/camera.aspect); camera.updateProjectionMatrix();
    }
    sync();
  }
  function useFallback(error) {
    preparation++; ready = false; wrapper.dataset.renderer = 'artwork';
    model?.dispose(); environment?.dispose(); renderer?.dispose(); renderer = null; canvas.remove();
    resize();
    options.onError?.(error);
  }
  async function prepareRenderer() {
    const current = ++preparation;
    ready = false;
    if (destroyed || lost || !renderer || !environment) return;
    try {
      // With KHR_parallel_shader_compile, the driver can finish the same final
      // shaders without stalling the first visible frame on their link status.
      await renderer.compileAsync(scene,camera);
      if (destroyed || lost || current !== preparation) return;
      ready = true; sync();
    } catch (error) {
      if (!destroyed && !lost && current === preparation) useFallback(error);
    }
  }
  const api = {
    setState(value) { if (destroyed) return; state = ORBI_STATES.includes(value) ? value : 'idle'; wrapper.dataset.state = state; if (!running() && visible()) draw(); },
    setMotion(value) { if (destroyed) return; enabled = !!value; gestureTime = -1; sync(); },
    setVisible(value) { if (destroyed) return; manuallyVisible = !!value; sync(); },
    setHeld(value) { if (destroyed) return; held = !!value; sync(); },
    playGesture(name = 'greet') { if (destroyed || !animated() || name !== 'greet') return; gestureTime = 0; },
    getStatus() { return { state, renderer: wrapper.dataset.renderer, motion: wrapper.dataset.motion, frames, destroyed }; },
    destroy() {
      if (destroyed) return; destroyed = true; preparation++; cancelAnimationFrame(frame);
      resizeObserver?.disconnect(); intersectionObserver?.disconnect(); removers.forEach(fn=>fn());
      model?.dispose(); environment?.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
      wrapper.remove(); shadow?.remove(); instances.delete(element);
    },
  };
  instances.set(element,api); wrapper.dataset.state = state; wrapper.dataset.renderer = 'artwork'; wrapper.dataset.motion = 'paused';
  // Artwork fallback uses the same clock and visibility lifecycle as WebGL.
  resizeObserver = new ResizeObserver(resize); resizeObserver.observe(element);
  intersectionObserver = new IntersectionObserver(entries => { inViewport = entries[0].isIntersecting; sync(); }); intersectionObserver.observe(element);
  listen(document,'visibilitychange',sync);
  listen(reduced,'change',event=>{reducedMotion=event.matches;sync();});
  if (renderMode === 'artwork') { resize(); return api; }
  try {
    const pixelRatio = Math.min(devicePixelRatio || 1,compact ? 2 : 1.75);
    // High-DPI compact avatars already have enough samples for smooth edges.
    // Retain MSAA on low-density displays and in the full-size character view.
    renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:!compact || pixelRatio < 1.5, powerPreference:'low-power' });
    renderer.setPixelRatio(pixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(33,1,.1,30); camera.position.set(0,0,5.75);
    scene.add(new THREE.HemisphereLight(0xf0f4ff,0x23334c,2.4));
    for (const [color,intensity,x,y,z] of [[0xfff1dd,3.5,-3,4,5],[0x91bded,2.5,4,1,-2],[0xffffff,2.8,-2,-1,-3]]) {
      const light = new THREE.DirectionalLight(color,intensity); light.position.set(x,y,z); scene.add(light);
    }
    model = createOrbiModel({compact}); scene.add(model.root); wrapper.append(canvas);
    listen(canvas,'webglcontextlost',e=>{ e.preventDefault(); preparation++; ready=false; lost=true; wrapper.dataset.renderer='artwork'; sync(); });
    // Image-backed environment pixels survive context loss. Three reuploads
    // this avatar's own texture with its other resources when rendering resumes.
    listen(canvas,'webglcontextrestored',()=>{ lost=false; resize(); prepareRenderer(); });
    if (interactive) {
      listen(element,'pointermove',e=>{ if (e.pointerType === 'touch') return; const r = element.getBoundingClientRect(); mouseX = Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)); mouseY = Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2)); });
      listen(element,'pointerleave',()=>{ mouseX=mouseY=0; });
    }
    resize();
    loadOrbiEnvironment(environmentUrl).then(texture => {
      if (destroyed) { texture.dispose(); return; }
      environment = texture; scene.environment = texture;
      // The first render has its final environment, avoiding a second shader
      // compilation when the image arrives.
      prepareRenderer();
    }).catch(error => { if (!destroyed) useFallback(error); });
  } catch (error) {
    useFallback(error);
  }
  return api;
}
