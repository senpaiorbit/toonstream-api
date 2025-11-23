import app from './src/app.js';

// For local development
const port = 3030;

console.log(`🚀 ToonStream API starting on port ${port}...`);
console.log(`📚 Documentation available at http://localhost:${port}/docs`);
console.log(`🌐 Base URL: https://toonstream.love`);

export default {
    port,
    fetch: app.fetch
};
