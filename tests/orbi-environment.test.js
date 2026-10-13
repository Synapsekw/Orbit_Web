import test from 'node:test';
import assert from 'node:assert/strict';
import { CubeUVReflectionMapping, LinearFilter, SRGBColorSpace } from 'three';
import { loadOrbiEnvironment } from '../src/orbi/orbi-environment.js';

test('the baked studio loads once while each avatar owns its GPU texture', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis,'document');
  t.after(()=>previous?Object.defineProperty(globalThis,'document',previous):delete globalThis.document);
  const images = [];
  globalThis.document = {createElementNS(){const image=new EventTarget();images.push(image);return image;}};

  const first = loadOrbiEnvironment(), second = loadOrbiEnvironment();
  assert.equal(images.length,1,'simultaneous avatars share the one image request');
  images[0].width=768; images[0].height=1024;
  images[0].dispatchEvent(new Event('load'));
  const [a,b] = await Promise.all([first,second]);
  assert.notEqual(a,b,'a renderer owns its texture disposal and context restoration');
  assert.equal(a.image,b.image,'decoded pixels remain available for reupload after context loss');
  for (const texture of [a,b]) {
    assert.equal(texture.mapping,CubeUVReflectionMapping,'prefiltered pixels bypass runtime PMREM');
    assert.equal(texture.colorSpace,SRGBColorSpace,'the baked PNG preserves the studio radiance');
    assert.equal(texture.flipY,false,'the bake retains render-target row order');
    assert.equal(texture.minFilter,LinearFilter);
    assert.equal(texture.generateMipmaps,false,'CubeUV stores all roughness levels in its atlas');
  }
  let secondDisposed=false;
  b.addEventListener('dispose',()=>{secondDisposed=true;});
  a.dispose();
  assert.equal(secondDisposed,false,'closing one avatar must leave the other texture alive');
  const reopened=await loadOrbiEnvironment();
  assert.equal(images.length,1,'reopening reuses already decoded studio pixels');
  assert.equal(reopened.image,b.image);
  b.dispose();reopened.dispose();
});

test('custom deployment paths share pixels only with the same environment URL', async t => {
  const previous=Object.getOwnPropertyDescriptor(globalThis,'document');
  t.after(()=>previous?Object.defineProperty(globalThis,'document',previous):delete globalThis.document);
  const images=[];
  globalThis.document={createElementNS(){const image=new EventTarget();images.push(image);return image;}};
  const first=loadOrbiEnvironment('/cdn/orbi/studio.png');
  const second=loadOrbiEnvironment('/cdn/orbi/studio.png');
  const other=loadOrbiEnvironment('/another-deployment/orbi/studio.png');
  assert.deepEqual(images.map(image=>image.src),['/cdn/orbi/studio.png','/another-deployment/orbi/studio.png']);
  images.forEach(image=>image.dispatchEvent(new Event('load')));
  const [a,b,c]=await Promise.all([first,second,other]);
  assert.equal(a.image,b.image);
  assert.notEqual(a.image,c.image,'separate deployments must not reuse a different studio');
  [a,b,c].forEach(texture=>texture.dispose());
});

test('a failed custom environment load can retry without poisoning its cache entry', async t => {
  const previous=Object.getOwnPropertyDescriptor(globalThis,'document');
  t.after(()=>previous?Object.defineProperty(globalThis,'document',previous):delete globalThis.document);
  const images=[];
  globalThis.document={createElementNS(){const image=new EventTarget();images.push(image);return image;}};
  const first=loadOrbiEnvironment('/retry/orbi/studio.png');
  assert.equal(images.length,1);
  const failure=new Event('error'),rejected=assert.rejects(first,error=>error===failure);
  images[0].dispatchEvent(failure); await rejected;
  const retry=loadOrbiEnvironment('/retry/orbi/studio.png');
  assert.equal(images.length,2,'failed image requests must be removed from the cache');
  images[1].dispatchEvent(new Event('load'));
  (await retry).dispose();
});
