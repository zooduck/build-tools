import * as fs from 'node:fs/promises';
import { buildTools } from './src/buildTools.module.js';

await fs.rm('dist', { recursive: true, force: true });
await fs.mkdir('dist');
await fs.copyFile('src/buildTools.module.js', 'dist/index.module.js');
await buildTools.removeCommentsFromFile('dist/index.module.js');
await buildTools.stampFileWithVersion('dist/index.module.js', 'package.json');
