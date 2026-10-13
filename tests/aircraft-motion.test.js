import test from 'node:test';
import assert from 'node:assert/strict';
import {aircraftPose,scrollProgress} from '../src/site/aircraft-motion.js';
test('scroll progress stays bounded before and after the hero',()=>{
 assert.equal(scrollProgress(100,800),0);assert.equal(scrollProgress(-400,800),.5);assert.equal(scrollProgress(-1200,800),1);assert.equal(scrollProgress(0,0),0);
});
test('reduced or paused motion removes scroll choreography without removing manual controls',()=>{
 const manual={yaw:.2,pitch:.1,scale:1.2};
 assert.deepEqual(aircraftPose(.8,manual,false),aircraftPose(0,manual,false));
 assert.notDeepEqual(aircraftPose(.8,manual,true),aircraftPose(0,manual,true));
 assert.notEqual(aircraftPose(0,manual,false).yaw,aircraftPose(0,{yaw:0,pitch:0,scale:1},false).yaw);
});
