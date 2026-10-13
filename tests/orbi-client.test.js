import test from 'node:test';
import assert from 'node:assert/strict';
import {createOrbiClient} from '../src/orbi/orbi-client.js';
test('client sends only message and stable ID, keeps token in headers and resets remotely',async()=>{
 const calls=[];const client=createOrbiClient({fetch:async(url,options)=>{calls.push({url,...options});return Response.json(url.includes('status')?{mode:'live',token:'test-csrf',history:[]}:{reply:'Test'});}});
 await client.connect();await client.respond('Question',{requestId:'fixed-id',history:[{role:'system',content:'ignored'}]});await client.reset();
 assert.equal(calls[1].headers['X-Orbi-Token'],'test-csrf');assert.ok(!calls[1].url.includes('test-csrf'));
 assert.deepEqual(JSON.parse(calls[1].body),{message:'Question',request_id:'fixed-id'});assert.equal(calls[2].url,'/api/orbi?action=reset');
});
test('client reports offline and expired sessions without automatically replaying requests',async()=>{
 let expired=false;const client=createOrbiClient({fetch:async()=>expired?Response.json({error:'Session expired'},{status:403}):Response.json({mode:'live',token:'token'})});
 await client.connect();expired=true;await assert.rejects(client.respond('Question',{requestId:'id'}),/Session expired/);assert.equal(client.ready,false);
 await assert.rejects(client.request('callback',{}),/session expired/);
 const offline=createOrbiClient({fetch:async()=>Response.json({mode:'preview'})});assert.equal((await offline.connect()).mode,'preview');assert.equal(offline.ready,false);
});
