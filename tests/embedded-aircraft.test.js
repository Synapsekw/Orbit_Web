import test from 'node:test';
import assert from 'node:assert/strict';
import {orbitCamera} from '../src/site/embedded-aircraft-camera.js';

test('embedded aircraft orbit keeps its target and distance without mutating the source camera',()=>{
 const camera={position:[12,20,34],target:[10,20,30]};
 const rotated=orbitCamera(camera,{yaw:Math.PI/2});
 assert.ok(Math.abs(rotated.position[0]-10)<1e-10);
 assert.ok(Math.abs(rotated.position[1]-22)<1e-10);
 assert.equal(rotated.position[2],34);
 assert.deepEqual(camera,{position:[12,20,34],target:[10,20,30]});
 assert.deepEqual(rotated.target,camera.target);
});

test('embedded aircraft zoom scales all axes around an off-origin target',()=>{
 assert.deepEqual(orbitCamera({position:[12,24,36],target:[10,20,30]},{zoom:.5}),{position:[11,22,33],target:[10,20,30]});
});

test('editorial elevated perspectives preserve distance and never cross a camera pole',()=>{
 const camera={position:[14,20,30],target:[10,20,30]};
 const elevated=orbitCamera(camera,{pitch:Math.PI/4,yaw:.8});
 assert.ok(elevated.position[2]>30);
 assert.ok(Math.abs(Math.hypot(...elevated.position.map((v,i)=>v-camera.target[i]))-4)<1e-10);
 const extreme=orbitCamera(camera,{pitch:100});
 assert.ok(extreme.position.every(Number.isFinite));
 assert.ok(Math.hypot(extreme.position[0]-10,extreme.position[1]-20)>0);
 assert.deepEqual(camera.position,[14,20,30]);
});
