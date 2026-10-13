import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { setImmediate } from 'node:timers/promises';

// Keep the real avatar, model, Three scene, materials and textures. Only the
// browser's WebGL driver is replaced so shader completion/loss can be ordered.
const renderers = [];
globalThis.__orbiTestRenderer = class {
  compilations = []; renders = 0; disposed = false;
  constructor({canvas}) { this.canvas=canvas; renderers.push(this); }
  setPixelRatio() {}
  setSize() {}
  compileAsync(scene,camera) {
    const pending=Promise.withResolvers();
    this.compilations.push({...pending,scene,camera});
    return pending.promise;
  }
  render() { this.renders++; }
  dispose() { this.disposed=true; }
  forceContextLoss() {}
};
const avatarUrl = new URL('../src/orbi/orbi-avatar.js',import.meta.url).href;
const facade = 'data:text/javascript,' + encodeURIComponent(`export * from ${JSON.stringify(import.meta.resolve('three'))}; export const WebGLRenderer=globalThis.__orbiTestRenderer;`);
const hook = registerHooks({resolve(specifier,context,nextResolve) {
  return specifier==='three' && context.parentURL===avatarUrl ? {url:facade,shortCircuit:true} : nextResolve(specifier,context);
}});
const {createOrbiAvatar} = await import(avatarUrl);
hook.deregister(); delete globalThis.__orbiTestRenderer;

function browserFixture(t) {
  class Element extends EventTarget {
    children=[]; dataset={}; style={};
    constructor(tagName) { super(); this.tagName=tagName; }
    set src(value) { this.url=value; if(this.tagName==='img') queueMicrotask(()=>this.dispatchEvent(new Event('load'))); }
    append(...items) { this.children.push(...items); }
    setAttribute() {}
    remove() { this.removed=true; }
    getBoundingClientRect() { return {width:88,height:88}; }
    getContext() { return {createRadialGradient:()=>({addColorStop(){}}),fillRect(){}}; }
  }
  const frames=new Map(),images=[]; let next=0;
  const values={
    HTMLElement:Element, devicePixelRatio:1,
    document:Object.assign(new EventTarget(),{hidden:false,createElement:tag=>new Element(tag),createElementNS:(_,tag)=>{const image=new Element(tag);images.push(image);return image;}}),
    matchMedia:()=>Object.assign(new EventTarget(),{matches:false}),
    ResizeObserver:class {constructor(callback){this.callback=callback;} observe(){this.callback();} disconnect(){}},
    IntersectionObserver:class {constructor(callback){this.callback=callback;} observe(){this.callback([{isIntersecting:true}]);} disconnect(){}},
    requestAnimationFrame:callback=>{frames.set(++next,callback);return next;},cancelAnimationFrame:id=>frames.delete(id),
  };
  for (const [name,value] of Object.entries(values)) {
    const original=Object.getOwnPropertyDescriptor(globalThis,name);
    Object.defineProperty(globalThis,name,{value,writable:true,configurable:true});
    t.after(()=>original?Object.defineProperty(globalThis,name,original):delete globalThis[name]);
  }
  return {host:new Element('button'),images,step(now=100){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback(now));}};
}

test('first WebGL render waits for the final studio shaders to finish', async t => {
  let avatar; t.after(()=>avatar?.destroy());
  const browser=browserFixture(t);
  avatar=createOrbiAvatar(browser.host,{compact:true,playful:true,environmentUrl:'/assets/shared-orbi/studio.png'});
  await setImmediate();
  const renderer=renderers.at(-1);
  assert.equal(browser.images[0].url,'/assets/shared-orbi/studio.png');
  assert.equal(renderer.compilations.length,1);
  assert.ok(renderer.compilations[0].scene.environment?.image,'compile with final lighting to reuse its shaders');
  browser.step();
  assert.equal(avatar.getStatus().renderer,'artwork');
  assert.equal(renderer.renders,0,'the driver must not block on unfinished shaders');
  renderer.compilations[0].resolve(); await setImmediate(); browser.step(134);
  assert.equal(avatar.getStatus().renderer,'webgl');
  assert.equal(renderer.renders,1);
});

test('destroying an avatar during shader preparation cannot revive or report errors', async t => {
  let avatar; t.after(()=>avatar?.destroy());
  const browser=browserFixture(t),errors=[];
  avatar=createOrbiAvatar(browser.host,{compact:true,playful:true,onError:error=>errors.push(error)});
  await setImmediate(); const renderer=renderers.at(-1);
  assert.equal(renderer.compilations.length,1);
  avatar.destroy(); renderer.compilations[0].reject(new Error('disposed context'));
  await setImmediate(); browser.step();
  assert.equal(renderer.renders,0);
  assert.deepEqual(errors,[]);
  assert.equal(avatar.getStatus().destroyed,true);
});

test('context restoration ignores a stale shader failure and prepares the new context', async t => {
  let avatar; t.after(()=>avatar?.destroy());
  const browser=browserFixture(t),errors=[];
  avatar=createOrbiAvatar(browser.host,{compact:true,playful:true,onError:error=>errors.push(error)});
  await setImmediate(); const renderer=renderers.at(-1);
  assert.equal(renderer.compilations.length,1);
  renderer.canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
  renderer.canvas.dispatchEvent(new Event('webglcontextrestored'));
  assert.equal(renderer.compilations.length,2);
  renderer.compilations[0].reject(new Error('old context'));
  await setImmediate(); browser.step();
  assert.deepEqual(errors,[]);
  assert.equal(renderer.disposed,false);
  assert.equal(renderer.renders,0);
  renderer.compilations[1].resolve(); await setImmediate(); browser.step(134);
  assert.equal(avatar.getStatus().renderer,'webgl');
});

test('a current shader preparation failure keeps the responsive artwork fallback', async t => {
  let avatar; t.after(()=>avatar?.destroy());
  const browser=browserFixture(t),errors=[];
  avatar=createOrbiAvatar(browser.host,{compact:true,playful:true,onError:error=>errors.push(error)});
  await setImmediate(); const renderer=renderers.at(-1),failure=new Error('driver failure');
  assert.equal(renderer.compilations.length,1);
  renderer.compilations[0].reject(failure);
  await setImmediate(); browser.step();
  assert.equal(avatar.getStatus().renderer,'artwork');
  assert.equal(avatar.getStatus().motion,'running');
  assert.equal(renderer.disposed,true);
  assert.deepEqual(errors,[failure]);
});
