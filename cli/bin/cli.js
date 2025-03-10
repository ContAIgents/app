#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const distPath = join(__dirname, '../dist/index.js');
import(distPath).catch(err => {
    console.error('Failed to load CLI:', err);
    process.exit(1);
});
