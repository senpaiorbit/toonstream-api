import { serve } from '@hono/node-server';
import app from './app.js';
import config from '../config.js';

// Start server for local development
const port = config.port;

console.log(`🚀 ToonStream API starting on port ${port}...`);
console.log(`📚 Documentation available at http://localhost:${port}/docs`);
console.log(`🌐 Base URL: ${config.baseUrl}`);

serve({
    fetch: app.fetch,
    port
});
