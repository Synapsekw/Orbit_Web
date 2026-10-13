import {orbiLocal} from './scripts/orbi-local.mjs';
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export default defineConfig({plugins:[orbiLocal()],build:{rollupOptions:{input:[...JSON.parse(readFileSync('pages-manifest.json','utf8')),'design-concepts/round-5/index.html','design-concepts/round-5/preview.html','design-concepts/round-6/index.html','design-concepts/round-6/preview.html','design-concepts/round-6/sources.html'].map(file=>resolve(file))}}});
