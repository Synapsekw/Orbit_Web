import sharp from 'sharp';
import { resolve } from 'node:path';

const images = {
  'progress-ivan.jpg': 'progress-aerial.webp',
  'walkthrough-interior.jpg': 'walkthrough-interior.webp',
  'timelapse-site.jpg': 'construction-timelapse.webp',
  'handover-villa.jpg': 'handover-architecture.webp',
  'handover-apartments.jpg': 'architectural-detail.webp',
  'spatial-model-preview.png': 'spatial-model-preview.webp',
};
for (const [source, output] of Object.entries(images)) {
  const info = await sharp(resolve('assets-source/capability-candidates', source))
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 86, effort: 5 })
    .toFile(resolve('public/images', output));
  console.log(`${output}: ${Math.round(info.size / 1024)} KB`);
}
