import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {gzipSync, gunzipSync} from 'node:zlib';
import {readFile} from 'node:fs/promises';
import {loadAircraftEdges} from '../src/site/aircraft-edges.js';

for (const manifest of ['m400-flight.json', 'm350-cad.json']) {
  test(`${manifest} ships smaller edge data without losing any CAD coordinates`, async () => {
    const metadata = JSON.parse(await readFile(`public/models/${manifest}`));
    for (const part of metadata.parts) {
      const raw = await readFile(`public${part.edges}`);
      const packed = await readFile(`public${part.edges}.gz`).catch(() => null);
      assert.ok(packed, `Missing compressed edges for ${part.name}`);
      assert.ok(packed.length < raw.length);
      assert.deepEqual(gunzipSync(packed), raw);
    }
  });
}

test('edge loading preserves geometry with gzip, legacy browsers, and a failed compressed request', async t => {
  const raw = Buffer.from(new Uint16Array([0, 65535, 0, 65535, 0, 65535]).buffer);
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    if (request.url === '/missing.bin.gz') { response.writeHead(404).end(); return; }
    if (request.url === '/encoded.bin.gz') response.setHeader('Content-Encoding', 'gzip');
    response.end(request.url.endsWith('.gz') ? gzipSync(raw) : raw);
  }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const part = {edges: `${base}/edges.bin`, bounds: [[-1, 1], [10, 20], [-5, 5]], segments: 1};
  const expected = [-1, 20, -5, 1, 10, 5];
  assert.deepEqual(Array.from(await loadAircraftEdges(part)), expected);
  assert.deepEqual(requests.splice(0), ['/edges.bin.gz']);
  assert.deepEqual(Array.from(await loadAircraftEdges({...part, edges: `${base}/encoded.bin`})), expected);
  assert.deepEqual(requests.splice(0), ['/encoded.bin.gz'], 'A host-decoded response must not be decompressed or downloaded twice');
  assert.deepEqual(Array.from(await loadAircraftEdges({...part, edges: `${base}/missing.bin`})), expected);
  assert.deepEqual(requests.splice(0), ['/missing.bin.gz', '/missing.bin']);
  const original = globalThis.DecompressionStream;
  t.after(() => { globalThis.DecompressionStream = original; });
  globalThis.DecompressionStream = undefined;
  assert.deepEqual(Array.from(await loadAircraftEdges(part)), expected);
  assert.deepEqual(requests, ['/edges.bin']);
});
