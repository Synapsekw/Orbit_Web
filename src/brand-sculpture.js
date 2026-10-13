import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

export async function createBrandSculpture(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .06);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, .2, 10.5);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; controls.enablePan = false;
  controls.enableDamping = true; controls.dampingFactor = .1;
  controls.rotateSpeed = .55;
  controls.minPolarAngle = .5; controls.maxPolarAngle = Math.PI - .5;
  scene.add(new THREE.HemisphereLight(0xe9f0ff, 0x26334e, 2));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fafff, 2.8);
  rim.position.set(4, 0, -2); scene.add(rim);

  // Extrude the actual paths from the original Orbit symbol, preserving its silhouette.
  const response = await fetch('/brand/orbit-symbol.svg');
  if (!response.ok) { renderer.dispose(); controls.dispose(); environment.dispose(); throw new Error('Brand asset unavailable'); }
  const document = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  document.querySelectorAll('[fill]').forEach(el => { if (el.getAttribute('fill').startsWith('url')) el.setAttribute('fill', '#ffffff'); });
  const svg = new SVGLoader().parse(new XMLSerializer().serializeToString(document));
  const solid = new THREE.Group(), points = new THREE.Group(), wire = new THREE.Group();
  const object = new THREE.Group(); object.add(solid, points, wire); scene.add(object);
  const metal = new THREE.MeshPhysicalMaterial({color:0xbfcbdc,metalness:.83,roughness:.27,clearcoat:.3,side:THREE.DoubleSide});
  for (const path of svg.paths) {
    if (path.userData.style.fill === 'none') continue;
    for (const shape of path.toShapes()) {
      const geometry = new THREE.ExtrudeGeometry(shape, {depth:40,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:3.5,bevelThickness:5,curveSegments:32});
      geometry.scale(1,-1,1);
      solid.add(new THREE.Mesh(geometry, metal));
    }
  }
  const bounds = new THREE.Box3().setFromObject(solid);
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 5.65 / bounds.getSize(new THREE.Vector3()).x;
  const pointMaterial = new THREE.PointsMaterial({color:0xc5d9ff,size:.016,sizeAttenuation:true,transparent:true,opacity:.88});
  const lineMaterial = new THREE.LineBasicMaterial({color:0x98b8e9,transparent:true,opacity:.7});
  solid.children.forEach(mesh => {
    mesh.geometry.translate(-center.x,-center.y,-center.z).scale(scale,scale,scale);
    const sampler = new MeshSurfaceSampler(mesh).build();
    const array = new Float32Array(6500*3), position = new THREE.Vector3();
    for(let i=0;i<6500;i++){sampler.sample(position);position.toArray(array,i*3);}
    const geometry = new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(array,3));
    points.add(new THREE.Points(geometry,pointMaterial));
    wire.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,25),lineMaterial));
  });
  object.rotation.set(.22,-.35,-.14);
  points.visible=wire.visible=false;
  container.append(renderer.domElement);
  container.classList.add('is-ready');
  let frame=0, remaining=0, visible=true, disposed=false, homeDistance=10.5;
  function tick(){frame=0;if(disposed||!visible)return;controls.update();renderer.render(scene,camera);if(--remaining>0)frame=requestAnimationFrame(tick);}
  function invalidate(){remaining=24;if(!frame&&visible&&!disposed)frame=requestAnimationFrame(tick);}
  controls.addEventListener('change',invalidate);
  const resize = new ResizeObserver(()=>{
    const {width,height}=container.getBoundingClientRect();
    renderer.setSize(width,height);camera.aspect=width/height;
    homeDistance=10.5*Math.max(1,.95/camera.aspect);
    camera.position.setLength(homeDistance);camera.updateProjectionMatrix();invalidate();
  });resize.observe(container);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)invalidate();});observer.observe(container);
  const listeners=[];
  const listen=(element,event,fn)=>{element.addEventListener(event,fn);listeners.push(()=>element.removeEventListener(event,fn));};
  container.closest('.identity-object').querySelectorAll('[data-sculpture]').forEach(button=>listen(button,'click',()=>{
    const mode=button.dataset.sculpture;
    solid.visible=mode==='solid';points.visible=mode==='points';wire.visible=mode==='wire';
    container.closest('.identity-object').querySelectorAll('[data-sculpture]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    invalidate();
  }));
  listen(container.closest('.identity-object').querySelector('#reset-sculpture'),'click',()=>{camera.position.set(0,.2,10.5).setLength(homeDistance);controls.target.set(0,0,0);controls.update();invalidate();});
  listen(renderer.domElement,'webglcontextlost',event=>{event.preventDefault();container.classList.remove('is-ready');});
  invalidate();
  return {destroy(){disposed=true;cancelAnimationFrame(frame);listeners.forEach(fn=>fn());resize.disconnect();observer.disconnect();controls.dispose();object.traverse(node=>node.geometry?.dispose());metal.dispose();pointMaterial.dispose();lineMaterial.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();}};
}
