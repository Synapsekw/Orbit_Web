import {readFile, writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import sharp from 'sharp';

// Derived from committed originals, so a clean checkout can rebuild everything.
// Keep raw CAD assets as the fallback for browsers without Compression Streams.
for (const manifest of ['m400-flight.json', 'm350-cad.json']) {
  const metadata = JSON.parse(await readFile(`public/models/${manifest}`));
  for (const part of metadata.parts) {
    await writeFile(`public${part.edges}.gz`, gzipSync(await readFile(`public${part.edges}`), {level: 9}));
  }
}
// Lighting pixels must remain exact: lossy compression changes the reflections.
await sharp('public/orbi/orbi-studio-cubeuv.png').webp({lossless: true, effort: 6})
  .toFile('public/orbi/orbi-studio-cubeuv.webp');
await sharp('public/orbi/orbi-fallback.webp').resize({width: 256}).webp({quality: 90})
  .toFile('public/orbi/orbi-launcher.webp');
await sharp('public/media/orbit-logo.png').resize({width: 450}).webp({lossless: true})
  .toFile('public/media/orbit-logo.webp');
console.log('Prepared lossless CAD delivery, studio lighting, and compact startup artwork.');
