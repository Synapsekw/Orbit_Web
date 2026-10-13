import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { postJSON, boundedText } from '../../netlify/lib/http.mjs';
import orbi, { config } from '../../netlify/functions/orbi.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));

test('Netlify entry uses trusted deploy context; production-looking environment cannot enable previews', async () => {
  const original = { ...process.env };
  Object.assign(process.env, { CONTEXT: 'production', ORBI_ENABLED: 'true',
    OPENAI_API_KEY: 'deployment-fixture-key', ORBI_SESSION_SECRET: 's'.repeat(64) });
  try {
    for (const deploy of [{ context: 'deploy-preview', published: false }, { context: 'production', published: false }, {}]) {
      const res = await orbi(new Request('https://www.orbitaerials.com/api/orbi?action=status'), { deploy });
      assert.deepEqual(await res.json(), { mode: 'preview' });
    }
    assert.ok([config.path].flat().includes('/api/orbi'));
  } finally {
    for (const name of Object.keys(process.env)) if (!(name in original)) delete process.env[name];
    Object.assign(process.env, original);
  }
});
test('bounded HTTP rejects insecure endpoints, oversized responses and slow response bodies', async () => {
  let called = false;
  await assert.rejects(postJSON(async () => { called = true; }, 'http://example.com', {}, {}, 100));
  assert.equal(called, false);
  await assert.rejects(postJSON(async () => new Response('x'.repeat(131073)), 'https://example.com', {}, {}, 100), RangeError);
  const keepAlive = setInterval(() => {}, 100);
  try {
    await assert.rejects(postJSON(async () => new Response(new ReadableStream({ start() {} })),
      'https://example.com', {}, {}, 20), { name: 'TimeoutError' });
  } finally { clearInterval(keepAlive); }
  await assert.rejects(boundedText(new ReadableStream({ start(c) { c.enqueue(new Uint8Array([0xff])); c.close(); } }), 10));
});
