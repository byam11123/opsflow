// OpsFlow 360 – Vercel Serverless Entry Point
// Loads the pre-built Express app from dist/server.cjs
// Does NOT import raw TypeScript source files (that caused ERR_MODULE_NOT_FOUND)

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Application } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);
const { app } = require(join(__dirname, '../dist/server.cjs')) as { app: Application };

export default app;
