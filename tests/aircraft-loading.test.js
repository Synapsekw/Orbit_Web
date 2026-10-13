import test from 'node:test';
import assert from 'node:assert/strict';
import {setAircraftState,syncAircraftState} from '../src/site/aircraft-state.js';

test('selected model stays loading until rendered, ignoring another model completing late',()=>{
  const attributes={};const stage={dataset:{platform:'m400'},setAttribute:(key,value)=>attributes[key]=value};
  assert.equal(syncAircraftState(stage),'loading');
  stage.dataset.platform='m350';
  setAircraftState(stage,'m400','ready');
  assert.equal(stage.dataset.modelState,'loading');
  assert.equal(attributes['aria-busy'],'true');
  setAircraftState(stage,'m350','error');
  assert.equal(stage.dataset.modelState,'error');
  stage.dataset.platform='m400';
  assert.equal(syncAircraftState(stage),'ready');
  assert.equal(attributes['aria-busy'],'false');
});
