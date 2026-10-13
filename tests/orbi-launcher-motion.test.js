import test from 'node:test';
import assert from 'node:assert/strict';
import * as motion from '../src/orbi/orbi-motion.js';

const sample = (...args) => {
  assert.equal(typeof motion.sampleLauncherMotion, 'function', 'launcher needs its own playful choreography');
  return motion.sampleLauncherMotion(...args);
};
const resting = {x:0,y:0,roll:0,yaw:0,scaleX:1,scaleY:1,shadowScale:1,shadowOpacity:.4};

test('page and device pause take priority over Orbi play without losing the local preference', () => {
  assert.equal(typeof motion.resolveOrbiMotion,'function');
  const cases = [
    [{enabled:true,allowed:true,reduced:false},{active:true,locked:false,reason:null}],
    [{enabled:false,allowed:true,reduced:false},{active:false,locked:false,reason:'orbi'}],
    [{enabled:true,allowed:false,reduced:false},{active:false,locked:true,reason:'page'}],
    [{enabled:false,allowed:false,reduced:false},{active:false,locked:true,reason:'page'}],
    [{enabled:true,allowed:true,reduced:true},{active:false,locked:true,reason:'device'}],
    [{enabled:true,allowed:false,reduced:true},{active:false,locked:true,reason:'device'}],
  ];
  for (const [input,expected] of cases) assert.deepEqual(motion.resolveOrbiMotion(input),expected);
});

test('closed launcher jumps, completes one turn and rebounds before its next rest', () => {
  const poses = Array.from({length:181}, (_, index) => sample(index / 10));
  assert.ok(Math.min(...poses.map(pose => pose.y)) < -25, 'the jump must be clearly visible');
  assert.ok(Math.max(...poses.map(pose => pose.yaw)) >= Math.PI * 1.99, 'Orbi should complete its spin');
  assert.ok(sample(4.4).y < -8, 'a second smaller bounce follows the soft landing');
  assert.ok(sample(9.6).y < -12, 'a separate hover keeps Orbi playful between leaps');
  for (const time of [0,1,6,7,13,15,17.8]) assert.deepEqual(sample(time),resting);
});

test('launcher choreography stays inside its reserved tap area with no accumulated rotation', () => {
  for (let time = 0; time <= 180; time += .025) {
    const pose = sample(time);
    assert.ok(Object.values(pose).every(Number.isFinite));
    assert.ok(pose.x >= -10 && pose.x <= 0);
    assert.ok(pose.y >= -30 && pose.y <= 3);
    assert.ok(Math.abs(pose.roll) <= 12);
    assert.ok(pose.yaw >= 0 && pose.yaw <= Math.PI * 2);
    assert.ok(pose.scaleX >= .9 && pose.scaleX <= 1.1);
    assert.ok(pose.scaleY >= .9 && pose.scaleY <= 1.1);
    assert.ok(pose.shadowOpacity >= .15 && pose.shadowOpacity <= .4);
  }
  for (const time of [0,2.8,3.5,4.4,9.6,17.9]) {
    const first = sample(time), repeated = sample(time + 180);
    for (const key in first) assert.ok(Math.abs(first[key] - repeated[key]) < 1e-10, key);
  }
});

test('reduced motion and invalid clocks always give a stable grounded pose', () => {
  for (const time of [-1,0,2.8,9.6,100000,NaN,Infinity]) assert.deepEqual(sample(time,false),resting);
  for (const time of [-1,NaN,Infinity]) assert.deepEqual(sample(time),resting);
});

test('leaps and the hover settle continuously into their dwell periods', () => {
  for (const boundary of [2.2,2.45,2.88,3.52,3.94,4.17,4.42,4.8,5.1,8,12.2,18]) {
    const before = sample(boundary-.00001), after = sample(boundary+.00001);
    for (const key of ['x','y','roll','scaleX','scaleY','shadowScale','shadowOpacity']) {
      assert.ok(Math.abs(before[key]-after[key]) < .01, `${key} jumps at ${boundary}`);
    }
    // A full 2π turn may reset to zero without changing the rendered orientation.
    assert.ok(Math.abs(Math.sin(before.yaw)-Math.sin(after.yaw)) < .01);
    assert.ok(Math.abs(Math.cos(before.yaw)-Math.cos(after.yaw)) < .01);
  }
});
