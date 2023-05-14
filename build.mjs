import * as fs from 'node:fs/promises';
import { buildTools } from './src/buildTools.module.mjs';

await fs.rm('dist', { recursive: true, force: true });
await fs.mkdir('dist');
await fs.copyFile('src/buildTools.module.mjs', 'dist/index.module.mjs');
await buildTools.removeCommentsFromFile('dist/index.module.mjs');
