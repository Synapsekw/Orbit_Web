import { build } from 'vite';
import { resolve } from 'node:path';
import { copyFile } from 'node:fs/promises';

// Separate output, preserving the fallback artwork and the website owner's build.
await build({
  configFile: false,
  publicDir: false,
  build: {
    outDir: 'public/orbi', emptyOutDir: false, copyPublicDir: false,
    lib: { entry: resolve('src/orbi/index.js'), formats: ['es'], fileName: () => 'orbi.js', cssFileName: 'orbi' },
    minify: true,
    rollupOptions: { output: { assetFileNames: '[name][extname]' } },
  },
});
for (const name of ['index.html','preview.js','preview.css']) {
  await copyFile(resolve('orbi-preview',name), resolve('public/orbi',name === 'index.html' ? 'preview.html' : name));
}
