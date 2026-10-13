import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';

const source = 'assets-source/customer-logos';
const output = 'public/brand/customers';
await mkdir(output, { recursive: true });
for (const [name, width] of [['sinohydro', 700], ['ugcc', 700], ['bay-zero', 440]]) {
  let artwork = sharp(`${source}/${name}.png`);
  // Remove the regional Spanish tagline, leaving the original symbol and wordmark.
  if (name === 'sinohydro') {
    const logoOnly = await artwork.composite([{ input: { create: { width: 1138, height: 84, channels: 4, background: '#000' } }, left: 400, top: 285, blend: 'dest-out' }]).toBuffer();
    artwork = sharp(logoOnly);
  }
  // Keep UGCC's original crest and acronym; omit the long bilingual descriptor.
  if (name === 'ugcc') {
    const crop = await artwork.extract({ left: 0, top: 0, width: 2780, height: 672 }).toBuffer();
    artwork = sharp(crop);
  }
  const result = await artwork
    .trim({ threshold: 5 })
    .resize({ width, withoutEnlargement: true })
    .webp({ lossless: true })
    .toFile(`${output}/${name}.webp`);
  console.log(`${name}: ${result.width} × ${result.height}, ${result.size} bytes`);
}
for (const name of ['future-kid', 'future-kid-white']) {
  await copyFile(`${source}/${name}.svg`, `${output}/${name}.svg`);
}
