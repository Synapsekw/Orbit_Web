import test from 'node:test';
import assert from 'node:assert/strict';
import {createOrbiAvatar} from '../src/orbi/orbi-avatar.js';

// Browser lifecycle boundaries are controlled; the avatar and its clock are real.
function browserFixture(t) {
  class Element extends EventTarget {
    children = []; dataset = {}; style = {}; className = '';
    append(...items) { this.children.push(...items); }
    setAttribute() {}
    remove() {}
    getBoundingClientRect() { return {width:88,height:88}; }
  }
  const document = Object.assign(new EventTarget(), {hidden:false,createElement:()=>new Element()});
  const media = Object.assign(new EventTarget(), {matches:false});
  let intersection, next = 0;
  const frames = new Map();
  const values = {
    HTMLElement:Element, document, matchMedia:()=>media,
    requestAnimationFrame:callback=>{frames.set(++next,callback);return next;},
    cancelAnimationFrame:id=>frames.delete(id),
    ResizeObserver:class { constructor(callback){this.callback=callback;} observe(){this.callback();} disconnect(){} },
    IntersectionObserver:class { constructor(callback){intersection=callback;} observe(){intersection([{isIntersecting:true}]);} disconnect(){} },
  };
  for (const [name,value] of Object.entries(values)) {
    const original = Object.getOwnPropertyDescriptor(globalThis,name);
    Object.defineProperty(globalThis,name,{value,writable:true,configurable:true});
    t.after(()=>original?Object.defineProperty(globalThis,name,original):delete globalThis[name]);
  }
  return {
    host:new Element(), document, media, frames,
    step(now) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback=>callback(now)); },
    intersect(value) { intersection([{isIntersecting:value}]); },
  };
}

test('artwork launcher holds its exact pose during targeting and resumes without a time jump', t => {
  let avatar;
  t.after(()=>avatar?.destroy());
  const browser = browserFixture(t);
  avatar = createOrbiAvatar(browser.host,{renderMode:'artwork',playful:true});
  assert.equal(avatar.getStatus().motion,'running','artwork fallback should remain playful');
  for (let now=100; now<=3200; now+=20) browser.step(now);
  const visual = browser.host.children.find(element=>element.className==='orbi-avatar');
  const heldPose = visual.style.transform;
  assert.ok(heldPose && !heldPose.includes('translate3d(0%,0%,0)'));
  avatar.setHeld(true);
  assert.equal(browser.frames.size,0);
  assert.equal(visual.style.transform,heldPose);
  browser.step(90000);
  avatar.setHeld(false);
  assert.equal(visual.style.transform,heldPose,'resuming does not reset to the ground');
  browser.step(90020);
  assert.notEqual(visual.style.transform,heldPose);
  assert.equal(browser.frames.size,1);
});

test('launcher cancels work when hidden, outside the viewport, open, or motion is reduced', t => {
  let avatar;
  t.after(()=>avatar?.destroy());
  const browser = browserFixture(t);
  avatar = createOrbiAvatar(browser.host,{renderMode:'artwork',playful:true});
  for (const suspend of [
    value=>{browser.document.hidden=value;browser.document.dispatchEvent(new Event('visibilitychange'));},
    value=>browser.intersect(!value),
    value=>avatar.setVisible(!value),
    value=>{browser.media.matches=value;const event=new Event('change');event.matches=value;browser.media.dispatchEvent(event);},
    value=>avatar.setMotion(!value),
  ]) {
    assert.equal(browser.frames.size,1);
    suspend(true);
    assert.equal(browser.frames.size,0);
    assert.equal(avatar.getStatus().motion,'paused');
    suspend(false);
    assert.equal(browser.frames.size,1);
  }
  avatar.destroy();
  assert.equal(browser.frames.size,0);
});
