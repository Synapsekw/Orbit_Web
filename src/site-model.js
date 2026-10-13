import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { rasterizeSurface } from './surface.js';

function randomGenerator(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

export async function createSiteModel({ pointCount = 260000, onProgress } = {}) {
  const decoder = new DRACOLoader().setDecoderPath('/draco/');
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  let gltf;
  try {
    gltf = await loader.loadAsync('/models/stadium-site.glb', event => {
      if(event.total)onProgress?.(`Loading site · ${Math.round(event.loaded/event.total*100)}%`);
    });
  } finally { decoder.dispose(); }
  onProgress?.('Preparing spatial views');
  // The GLB stores its capture orientation in the node transform. Apply it once.
  const source = gltf.scene.children[0];
  source.updateWorldMatrix(true,false);
  const geometry = source.geometry.clone().applyMatrix4(source.matrixWorld);
  geometry.rotateY(-Math.PI/7);
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox,center=bounds.getCenter(new THREE.Vector3());
  const size=bounds.getSize(new THREE.Vector3()),scale=52/Math.max(size.x,size.z);
  geometry.translate(-center.x,-bounds.min.y,-center.z);geometry.scale(scale,scale,scale);
  geometry.computeBoundingBox();
  const dimensions=geometry.boundingBox.getSize(new THREE.Vector3());
  const texture=source.material.map;
  texture.anisotropy=8;
  // Photography already contains sunlight and shadows; preserve that lighting.
  const photoMaterial=new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:THREE.DoubleSide});
  const photogrammetry=new THREE.Mesh(geometry,photoMaterial);
  photogrammetry.name='Photographed construction site';

  const atlas=document.createElement('canvas');
  atlas.width=Math.min(2048,texture.image.width);atlas.height=Math.min(2048,texture.image.height);
  const ctx=atlas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(texture.image,0,0,atlas.width,atlas.height);
  const pixels=ctx.getImageData(0,0,atlas.width,atlas.height).data;
  const random=randomGenerator(42);
  const sampler=new MeshSurfaceSampler(photogrammetry).setRandomGenerator(random).build();
  const p=new THREE.Vector3(),n=new THREE.Vector3(),uv=new THREE.Vector2(),c=new THREE.Color(),neutral=new THREE.Color();
  const positions=new Float32Array(pointCount*3),colors=new Float32Array(pointCount*3);
  for(let i=0;i<pointCount;i++){
    sampler.sample(p,n,undefined,uv);
    const x=Math.min(atlas.width-1,Math.max(0,Math.floor(uv.x*atlas.width)));
    const y=Math.min(atlas.height-1,Math.max(0,Math.floor(uv.y*atlas.height)));
    const k=(y*atlas.width+x)*4;
    c.setRGB(pixels[k]/255,pixels[k+1]/255,pixels[k+2]/255,THREE.SRGBColorSpace);
    const luminance=c.r*.2126+c.g*.7152+c.b*.0722;
    c.lerp(neutral.setRGB(luminance*.8+.12,luminance*.95+.15,luminance*1.1+.19),.83);
    positions.set([p.x,p.y,p.z],i*3);colors.set([c.r,c.g,c.b],i*3);
  }
  const cloudGeometry=new THREE.BufferGeometry();
  cloudGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  cloudGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const cloudMaterial=new THREE.PointsMaterial({size:1.15,sizeAttenuation:false,vertexColors:true,toneMapped:false});
  cloudMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (length(gl_PointCoord - vec2(0.5)) > 0.48) discard;');};
  const cloud=new THREE.Points(cloudGeometry,cloudMaterial);cloud.renderOrder=1;
  const occluder=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2}));
  const points=new THREE.Group();points.add(occluder,cloud);

  const cols=300,rows=Math.round(cols*dimensions.z/dimensions.x);
  const triangles=geometry.toNonIndexed();
  const {heights,coverage}=rasterizeSurface(triangles.attributes.position.array,dimensions.x,dimensions.z,cols,rows);
  triangles.dispose();
  const dsmGeo=new THREE.PlaneGeometry(dimensions.x,dimensions.z,cols,rows);dsmGeo.rotateX(-Math.PI/2);
  const dsmPositions=dsmGeo.attributes.position, dsmColors=new Float32Array(dsmPositions.count*3);
  const ramp=['#254d88','#2a858c','#69b3a0','#b4c787','#e3bb72','#ce8055'].map(v=>new THREE.Color(v));
  let maxHeight=0;for(const h of heights)maxHeight=Math.max(maxHeight,h);
  for(let i=0;i<dsmPositions.count;i++){
    dsmPositions.setY(i,heights[i]);
    const t=THREE.MathUtils.clamp(heights[i]/maxHeight,0,1)*(ramp.length-1),lo=Math.floor(t);
    c.copy(ramp[lo]).lerp(ramp[Math.min(lo+1,ramp.length-1)],t-lo);dsmColors.set([c.r,c.g,c.b],i*3);
  }
  // Exclude empty cells outside the captured scan boundary.
  const validIndices=[],indices=dsmGeo.index.array;
  for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2];if(coverage[a]&&coverage[b]&&coverage[c])validIndices.push(a,b,c);}
  dsmGeo.setIndex(validIndices);
  dsmGeo.setAttribute('color',new THREE.BufferAttribute(dsmColors,3));dsmGeo.computeVertexNormals();
  const dsm=new THREE.Mesh(dsmGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));
  source.geometry.dispose();source.material.dispose();
  return {photogrammetry,points,dsm,maxHeight,pointCount};
}
