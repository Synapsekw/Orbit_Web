import fs from 'node:fs/promises';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,simplify,draco} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import draco3d from 'draco3dgltf';

const root='assets-source/m350/flight',parts=JSON.parse(await fs.readFile(`${root}/parts.json`));
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene();
const material=doc.createMaterial('M350 CAD surface').setBaseColorFactor([.02,.055,.085,1]);
const manifest=[],framingBounds=Array.from({length:3},()=>[Infinity,-Infinity]);
for(const part of parts){
 const pivot=part.pivot||[0,0,0],input=await fs.readFile(`${root}/${part.name}.stl`);
 const geometry=new STLLoader().parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength));
 const positions=geometry.attributes.position.array;positions.forEach((v,i)=>positions[i]=v-pivot[i%3]);
 const accessor=doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer);
 const primitive=doc.createPrimitive().setAttribute('POSITION',accessor).setMaterial(material);
 scene.addChild(doc.createNode(part.name).setTranslation(pivot).setMesh(doc.createMesh(part.name).addPrimitive(primitive)));
 const raw=await fs.readFile(`${root}/${part.name}-edges.bin`),values=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4);
 // Bound the full rotor sweep, not only the source assembly's parked blades.
 for(let i=0;i<values.length;i+=3){
  const v=[0,1,2].map(k=>values[i+k]-pivot[k]);
  const along=part.axis?v.reduce((s,n,k)=>s+n*part.axis[k],0):0;
  const radiusSq=Math.max(0,v.reduce((s,n)=>s+n*n,0)-along*along);
  for(let k=0;k<3;k++){
   const center=part.axis?pivot[k]+along*part.axis[k]:values[i+k];
   const reach=part.axis?Math.sqrt(radiusSq*(1-part.axis[k]**2)):0;
   framingBounds[k][0]=Math.min(framingBounds[k][0],center-reach);
   framingBounds[k][1]=Math.max(framingBounds[k][1],center+reach);
  }
 }
 const bounds=part.bounds.map((range,i)=>range.map(v=>v-pivot[i])),quantized=new Uint16Array(values.length);
 values.forEach((v,i)=>{const [lo,hi]=bounds[i%3];quantized[i]=Math.round((v-pivot[i%3]-lo)/(hi-lo)*65535);});
 const edges=`/models/m350-flight-${part.name}-edges.bin`;await fs.writeFile('public'+edges,new Uint8Array(quantized.buffer));
 manifest.push({name:part.name,edges,bounds,pivot,axis:part.axis,direction:part.direction,segments:part.segments,sourceTriangles:positions.length/9});
 geometry.dispose();
}
await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.encoder':await draco3d.createEncoderModule()});
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.28,error:.001}),draco());
const model='/models/m350-flight.glb';await fs.writeFile('public'+model,await io.writeBinary(doc));
const metadata={source:'https://enterprise.dji.com/matrice-350-rtk/downloads',model,parts:manifest,framingBounds,rights:'Manufacturer CAD; local evaluation. Public redistribution permission remains to be confirmed.'};
await fs.writeFile('public/models/m350-cad.json',JSON.stringify(metadata,null,2));
console.log({parts:manifest.length,sourceTriangles:manifest.reduce((a,p)=>a+p.sourceTriangles,0),segments:manifest.reduce((a,p)=>a+p.segments,0),triangles:doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((s,p)=>s+p.getIndices().getCount()/3,0),0),modelBytes:(await fs.stat('public'+model)).size});
