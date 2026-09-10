// CommonJS handler for Vercel Serverless Function
// Must be .cjs because package.json has "type": "module"
const { app } = require('../dist/server.cjs');
module.exports = app;
