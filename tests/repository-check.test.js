import test from 'node:test';
import assert from 'node:assert/strict';
import {checkFile} from '../scripts/check-repository.mjs';

test('repository scan rejects private paths, configured secrets, keys and oversized files',()=>{
 for(const file of ['.env.local','sub/.env','settings.local.json','assets-source/scan.jpg','.local/request.json','node_modules/package/index.js','dist/index.html'])assert.throws(()=>checkFile(file,Buffer.from('test')),/Private or generated/);
 assert.throws(()=>checkFile('src/config.js',Buffer.from('private-fixture-value'),['private-fixture-value']),/Configured secret/);
 assert.throws(()=>checkFile('public/config.txt',Buffer.from('sk-proj-'+'A'.repeat(60))),/Credential pattern/);
 assert.throws(()=>checkFile('model.glb',Buffer.alloc(100*1024*1024)),/100 MiB/);
});
test('repository scan allows placeholder configuration, source and optimized assets',()=>{
 for(const file of ['.env.example','server/knowledge.txt','netlify/lib/config.mjs','public/models/m400-flight.glb'])assert.doesNotThrow(()=>checkFile(file,Buffer.from('OPENAI_API_KEY=\nfixture data')));
});
