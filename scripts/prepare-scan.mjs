import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { flatten, join, weld, simplify, textureCompress, draco } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const source=process.argv[2]??'stadium-site';
const ratio=Number(process.argv[3]??0.75);
const document = await io.read(`assets-source/${source}.glb`);
console.log('Source textures:',document.getRoot().listTextures().map(t=>t.getSize()));
await document.transform(
  flatten(),
  join(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.001 }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [6144,6144], quality: 90 }),
  draco(),
);
await io.write(`public/models/${source}.glb`, document);
console.log(`Prepared ${source}.`);
