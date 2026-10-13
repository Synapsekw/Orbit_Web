import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPage} from '../src/site/render.js';
import {routes} from '../src/site/data.js';

test('aircraft are part of the page rather than separate 3D dialogs',()=>{
 for(const path of ['/','/services/','/fleet/']){
  const html=renderPage(routes.find(r=>r.path===path));
  assert.doesNotMatch(html,/data-viewer="(?:m350|elios)"/);
  assert.match(html,/data-inline-aircraft="elios"/);
  assert.match(html,/href="https:\/\/www.flyability.com\/elios-3"/);
 }
});

test('fleet supplies all three inline aircraft and Elios uses distinct editorial views',()=>{
 const fleet=renderPage(routes.find(r=>r.path==='/fleet/'));
 for(const id of ['m400','m350','elios'])assert.ok(fleet.includes(`data-inline-aircraft="${id}"`));
 const home=renderPage(routes.find(r=>r.path==='/'));
 const services=renderPage(routes.find(r=>r.path==='/services/'));
 assert.match(home,/data-aircraft-view="profile"/);
 assert.match(services,/data-aircraft-view="elevated"/);
 assert.match(fleet,/data-aircraft-view="three-quarter"/);
});

test('privacy accurately describes automatically embedded external Elios model',()=>{
 const html=renderPage(routes.find(r=>r.path==='/privacy/'));
 assert.match(html,/automatically/i);
 assert.doesNotMatch(html,/Choosing to load one|models are optional external viewers/);
});
