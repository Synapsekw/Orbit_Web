import {arrowIcon} from './ui/icons.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export async function createPanorama(container, { onReady, onError, signal } = {}) {
  if(signal?.aborted)return null;
  let renderer, texture, disposed = false;
  let pendingAborted=false;
  const cancelPending=()=>{pendingAborted=true;renderer?.dispose();renderer?.forceContextLoss();container.replaceChildren();};
  signal?.addEventListener('abort',cancelPending,{once:true});
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    texture = await new THREE.TextureLoader().loadAsync('/images/construction-360.webp');
  } catch (error) { if(!pendingAborted){renderer?.dispose();onError?.(error);}return null; }
  finally { signal?.removeEventListener('abort',cancelPending); }
  if(pendingAborted||signal?.aborted){texture?.dispose();return null;}
  texture.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(10, 64, 40);
  geometry.scale(-1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.PerspectiveCamera(75, 1, .001, 20);
  camera.position.set(0, 0, .01);
  const controls = new OrbitControls(camera, renderer.domElement);
  renderer.domElement.style.touchAction='pan-y';
  controls.enablePan = false; controls.enableZoom = false;
  controls.enableDamping = true; controls.dampingFactor = .09;
  controls.rotateSpeed = -.3;
  controls.minPolarAngle = .1; controls.maxPolarAngle = Math.PI - .1;
  controls.update();
  container.append(renderer.domElement);
  let frame = 0, remaining = 0, inFrame = false, visible = true;
  function schedule() { if (!frame && !inFrame && visible && !document.hidden && !disposed) frame = requestAnimationFrame(draw); }
  function draw() {
    frame = 0; if (disposed || !visible || document.hidden) return;
    inFrame = true; controls.update(); renderer.render(scene, camera); inFrame = false;
    if (--remaining > 0) schedule();
  }
  function invalidate() { remaining = 32; schedule(); }
  controls.addEventListener('change', invalidate);
  const resize = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height));
    camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); invalidate();
  });
  resize.observe(container);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) invalidate(); else { cancelAnimationFrame(frame); frame = 0; } });
  observer.observe(container);
  function visibilityChange() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else invalidate(); }
  document.addEventListener('visibilitychange', visibilityChange);
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); onError?.(new Error('Context lost')); });
  onReady?.(); invalidate();
  return {
    zoom(amount) { camera.fov = THREE.MathUtils.clamp(camera.fov + amount, 40, 100); camera.updateProjectionMatrix(); invalidate(); },
    look(horizontal, vertical = 0) {
      const sphere = new THREE.Spherical().setFromVector3(camera.position);
      sphere.theta += horizontal; sphere.phi = THREE.MathUtils.clamp(sphere.phi + vertical, .1, Math.PI - .1);
      camera.position.setFromSpherical(sphere); controls.update(); invalidate();
    },
    reset() { camera.position.set(0, 0, .01); camera.fov = 75; camera.updateProjectionMatrix(); controls.update(); invalidate(); },
    destroy() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); document.removeEventListener('visibilitychange', visibilityChange); controls.dispose(); geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose(); container.replaceChildren(); },
  };
}

export function initPanoramas() {
  const cleanups = [];
  const observer = new IntersectionObserver(entries => {
    for (const { target: plate, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(plate);
      const view = plate.querySelector('.panorama-view'), status = plate.querySelector('.panorama-status');
      const buttons = [...plate.querySelectorAll('[data-pano-action]')];
      createPanorama(view, {
        onReady: () => { status.hidden = true; },
        onError: () => { status.hidden = false; status.textContent = 'The 360° view could not load. Refresh to try again.'; buttons.forEach(b => b.disabled = true); },
      }).then(viewer => {
        if (!viewer) return;
        cleanups.push(() => viewer.destroy());
        buttons.forEach(button => {
          if (button.dataset.panoAction === 'fullscreen' && !plate.requestFullscreen) { button.hidden = true; return; }
          button.disabled = false;
          button.addEventListener('click', async () => {
            switch (button.dataset.panoAction) {
              case 'in': viewer.zoom(-10); break;
              case 'out': viewer.zoom(10); break;
              case 'reset': viewer.reset(); break;
              case 'fullscreen':
                try { if (document.fullscreenElement) await document.exitFullscreen(); else await plate.requestFullscreen(); }
                catch { status.hidden = false; status.textContent = 'Fullscreen is unavailable in this browser. You can still explore the view here.'; }
                break;
            }
          });
        });
        const canvas = view.querySelector('canvas');
        canvas.tabIndex = 0;
        canvas.setAttribute('aria-label', '360 degree construction panorama. Drag to look around. Arrow keys look, plus and minus zoom, Home resets.');
        canvas.addEventListener('keydown', event => {
          const action = { ArrowLeft: () => viewer.look(.15), ArrowRight: () => viewer.look(-.15), ArrowUp: () => viewer.look(0,-.12), ArrowDown: () => viewer.look(0,.12), '+': () => viewer.zoom(-10), '=': () => viewer.zoom(-10), '-': () => viewer.zoom(10), Home: () => viewer.reset() }[event.key];
          if (action) { event.preventDefault(); action(); }
        });
      });
    }
  }, { rootMargin: '200px' });
  document.querySelectorAll('.panorama-plate').forEach(plate => observer.observe(plate));
  const updateFullscreen = () => document.querySelectorAll('[data-pano-action="fullscreen"]').forEach(button => { const full = document.fullscreenElement === button.closest('.panorama-plate'); button.textContent = full ? 'Exit fullscreen ' : 'Fullscreen '; button.insertAdjacentHTML('beforeend',arrowIcon(full?'down-left':'up-right')); button.setAttribute('aria-label', full ? 'Exit panorama fullscreen' : 'Open panorama fullscreen'); });
  document.addEventListener('fullscreenchange', updateFullscreen);
  addEventListener('pagehide', event => { if(event.persisted)return; observer.disconnect(); document.removeEventListener('fullscreenchange', updateFullscreen); cleanups.forEach(fn => fn()); });
}
