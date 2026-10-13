import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceFlight,flightOffset,rotorAngle} from '../src/site/m400-flight.js';

test('flight and propellers freeze while paused; manual inspection holds aircraft turn only',()=>{
 const start={aircraft:4,rotors:9};
 assert.deepEqual(advanceFlight(start,.02,false,false),start);
 assert.deepEqual(advanceFlight(start,.02,true,true),{aircraft:4,rotors:9.02});
 assert.deepEqual(advanceFlight(start,.02,true,false),{aircraft:4.02,rotors:9.02});
});

test('flight timing is frame-rate independent and never jumps after a suspended tab',()=>{
 const simulate=fps=>{let state={aircraft:0,rotors:0};for(let i=0;i<fps*2;i++)state=advanceFlight(state,1/fps,true,false);return state;};
 assert.ok(Math.abs(simulate(30).aircraft-simulate(120).aircraft)<1e-10);
 assert.equal(advanceFlight({aircraft:2,rotors:2},90,true,false).aircraft,2.05);
});

test('flight gently hovers and turns while adjacent rotors counter-rotate',()=>{
 for(let t=0;t<100;t+=.13){const p=flightOffset(t);assert.ok(Math.abs(p.y)<=.055);assert.ok(Math.abs(p.x)<=.018);assert.ok(Math.abs(p.roll)<=.015);assert.ok(Math.abs(p.pitch)<=.012);}
 assert.ok(flightOffset(20).yaw>flightOffset(2).yaw);
 assert.equal(rotorAngle(.2,1),-rotorAngle(.2,-1));
 assert.notEqual(rotorAngle(.2,1),rotorAngle(.3,1));
});
