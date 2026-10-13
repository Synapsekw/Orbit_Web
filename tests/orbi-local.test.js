import test from 'node:test';
import assert from 'node:assert/strict';
import {readLocalConfig} from '../scripts/orbi-local.mjs';

const env={ORBI_LOCAL_ENABLED:'true',OPENAI_API_KEY:'fixture-openai-key',ORBI_SESSION_SECRET:'fixture-secret-'.repeat(5),GROKBOT_WEBHOOK_URL:'https://api2.cursor.sh/automations/webhook/fixture',GROKBOT_WEBHOOK_KEY:'fixture-bot-key'};
test('local OpenAI activation keeps real handoffs off unless separately enabled',()=>{
 const local=readLocalConfig(env);assert.equal(local.ready,true);assert.equal(local.callback,null);assert.equal(local.local,true);assert.equal(local.mock,false);
 const enabled=readLocalConfig({...env,ORBI_LOCAL_CALLBACKS_ENABLED:'true'});assert.equal(enabled.callback.key,env.GROKBOT_WEBHOOK_KEY);
 assert.equal(readLocalConfig({...env,ORBI_LOCAL_CALLBACKS_ENABLED:'true',GROKBOT_WEBHOOK_KEY:''}).callback,null);
 assert.equal(readLocalConfig({...env,ORBI_LOCAL_ENABLED:'false'}).ready,false);
});
test('mock preview replaces both provider and bot credentials with fixtures',()=>{
 const mock=readLocalConfig({...env,ORBI_LOCAL_ENABLED:'false'},{mock:true});
 assert.equal(mock.ready,true);assert.equal(mock.mock,true);assert.equal(mock.provider.key,'local-fixture');assert.equal(mock.callback.key,'local-fixture');
 assert.notEqual(mock.secret,env.ORBI_SESSION_SECRET);
});
