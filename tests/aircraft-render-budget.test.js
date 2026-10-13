import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

// Catch accidentally shipping manufacturing-density backing surfaces again.
// The visible CAD lines are separate assets and retain their original detail.
for(const [id,manifest] of [['m400','m400-flight.json'],['m350','m350-cad.json']]){
 test(`${id} keeps its animated CAD assembly within the surface rendering budget`,async()=>{
  const metadata=JSON.parse(await fs.readFile(`public/models/${manifest}`));
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
  const doc=await io.read('public'+metadata.model);
  const nodes=doc.getRoot().listNodes();
  assert.equal(metadata.parts.length,5);
  assert.equal(new Set(metadata.parts.map(part=>part.name)).size,5);
  assert.deepEqual(nodes.map(node=>node.getName()).sort(),metadata.parts.map(part=>part.name).sort(),'Unexpected scene nodes must not escape the rendering budget');
  assert.equal(doc.getRoot().listMeshes().length,5);
  let triangles=0;
  for(const part of metadata.parts){
   const node=nodes.find(n=>n.getName()===part.name);
   assert.ok(node?.getMesh(),`${part.name} still has a solid backing surface`);
   assert.deepEqual(node.getTranslation(),part.pivot,'Optimization must retain the propeller hubs');
   for(const primitive of node.getMesh().listPrimitives()){
    const count=primitive.getIndices().getCount()/3;
    assert.ok(count>0);
    triangles+=count;
   }
  }
  assert.equal(metadata.parts.filter(part=>part.axis).length,4);
  assert.ok(triangles<=30000,`${id} has ${triangles} surface triangles; budget is 30000`);
 });
}
