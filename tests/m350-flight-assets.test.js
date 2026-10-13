import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import {Vector3} from 'three';

test('M350 contains four independent propeller assemblies aligned to their CAD hubs',async()=>{
 const metadata=JSON.parse(await fs.readFile('public/models/m350-cad.json'));
 const rotors=metadata.parts.filter(p=>p.axis);
 assert.equal(rotors.length,4,'All four M350 propellers must animate independently');
 assert.equal(metadata.parts.length,5,'The fuselage and motor mounts stay in the body');
 assert.equal(metadata.parts.reduce((n,p)=>n+p.segments,0),48674,'Splitting must preserve all CAD linework');
 assert.equal(metadata.parts.reduce((n,p)=>n+p.sourceTriangles,0),478820,'Splitting must preserve all source surfaces');
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
 const doc=await io.read('public'+metadata.model);
 const nodes=doc.getRoot().listNodes();
 assert.equal(nodes.length,5);
 for(const part of metadata.parts){
  const node=nodes.find(n=>n.getName()===part.name);
  assert.ok(node?.getMesh(),'Every animated part has its own surface');
  assert.deepEqual(node.getTranslation(),part.pivot);
  const edges=await fs.readFile('public'+part.edges);
  assert.equal(edges.byteLength,part.segments*6*2);
  if(part.axis){
   const positions=node.getMesh().listPrimitives()[0].getAttribute('POSITION').getArray();
   const axis=new Vector3(...part.axis),pivot=new Vector3(...part.pivot);
   for(let angle=0;angle<Math.PI*2;angle+=Math.PI/4){
    for(let i=0;i<positions.length;i+=3){
     const vertex=new Vector3().fromArray(positions,i).applyAxisAngle(axis,angle).add(pivot);
     vertex.toArray().forEach((v,k)=>assert.ok(v>=metadata.framingBounds[k][0]-3&&v<=metadata.framingBounds[k][1]+3,'Framing encloses the rotating blade surfaces (3 mm CAD tessellation tolerance)'));
    }
   }
  }
 }
 for(const rotor of rotors){
  assert.ok(Math.abs(Math.hypot(...rotor.axis)-1)<1e-6);
  assert.ok(rotor.axis[1]>.99,'The rotor axis follows its near-vertical CAD hinge');
  assert.ok(Math.abs(rotor.pivot[0])>300&&Math.abs(rotor.pivot[0])<370);
  assert.ok(rotor.pivot[1]>-70&&rotor.pivot[1]<-55);
  assert.ok(Math.abs(rotor.pivot[2])>280&&Math.abs(rotor.pivot[2])<320);
  for(const other of rotors){
   const adjacent=(Math.sign(rotor.pivot[0])===Math.sign(other.pivot[0]))!==(Math.sign(rotor.pivot[2])===Math.sign(other.pivot[2]));
   if(adjacent)assert.equal(rotor.direction,-other.direction);
  }
 }
});
