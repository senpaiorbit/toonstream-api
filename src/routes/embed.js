import { Hono } from 'hono';
import { html } from 'hono/html';
import { scrapeEpisodeStreaming } from '../scrapers/streaming.js';
import CryptoJS from 'crypto-js';
import config from '../../config.js';

const embed = new Hono();

// Secret key for encryption (should be in config/env in production)
const SECRET_KEY = config.secretKey || 'toonstream-secret-key';

/**
 * Encrypt data
 * @param {object} data - Data to encrypt
 * @returns {string} Encrypted string
 */
const encrypt = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

/**
 * GET /api/source/:id
 * Get direct/encoded sources for an episode
 */
embed.get('/api/source/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await scrapeEpisodeStreaming(id);

        if (!data || !data.sources || data.sources.length === 0) {
            return c.json({
                success: false,
                error: 'No sources found'
            }, 404);
        }

        // Filter and process sources
        const sources = data.sources.map(source => ({
            file: source.url,
            label: source.quality || 'Auto',
            type: source.type === 'iframe' ? 'iframe' : (source.mimeType || 'video/mp4')
        }));

        // Encrypt sources for security (optional, based on requirement)
        const encrypted = encrypt(sources);

        return c.json({
            success: true,
            sources,
            encrypted,
            tracks: [], // Subtitles if available
            intro: { start: 0, end: 0 }, // Intro skip if available
            outro: { start: 0, end: 0 }  // Outro skip if available
        });
    } catch (error) {
        console.error('Source route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

/**
 * GET /embed/:id
 * Serve HTML embed player
 */
embed.get('/embed/:id', async (c) => {
    const id = c.req.param('id');

    return c.html(html`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ToonStream Player</title>
            <style>
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
                #player { width: 100%; height: 100%; }
                .error { color: #fff; display: flex; justify-content: center; align-items: center; height: 100%; font-family: sans-serif; }
                
                /* Ad blocking CSS */
                iframe[src*="ads"],
                iframe[src*="doubleclick"],
                iframe[src*="googlesyndication"],
                iframe[src*="adservice"],
                div[class*="ad-"],
                div[id*="ad-"],
                .advertisement,
                .ad-container {
                    display: none !important;
                    visibility: hidden !important;
                    width: 0 !important;
                    height: 0 !important;
                }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js"></script>
        </head>
        <body>
            <div id="player"></div>
            <script>
                let currentSourceIndex = 0;
                let sources = [];

                async function initPlayer() {
                    try {
                        const response = await fetch('/api/source/${id}');
                        const data = await response.json();

                        if (!data.success) {
                            document.getElementById('player').innerHTML = '<div class="error">' + (data.error || 'Error loading video') + '</div>';
                            return;
                        }

                        // Strictly ignore the 1st server as requested
                        if (data.sources.length > 0) {
                            sources = data.sources.slice(1);
                        } else {
                            sources = [];
                        }

                        if (sources.length === 0) {
                             document.getElementById('player').innerHTML = '<div class="error">No working sources found</div>';
                             return;
                        }

                        loadSource(0);
                    } catch (error) {
                        console.error(error);
                        document.getElementById('player').innerHTML = '<div class="error">Failed to load player</div>';
                    }
                }

                function loadSource(index) {
                    if (index >= sources.length) {
                        document.getElementById('player').innerHTML = '<div class="error">All sources failed to load</div>';
                        return;
                    }

                    currentSourceIndex = index;
                    const source = sources[index];
                    
                    if (source.type === 'iframe') {
                        const iframe = document.createElement('iframe');
                        iframe.src = source.file;
                        iframe.frameBorder = '0';
                        iframe.allowFullscreen = true;
                        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                        iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-presentation';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        
                        // Auto-switch to next source after 5 seconds if iframe doesn't load properly
                        const timeout = setTimeout(() => {
                            console.log('Source ' + (index + 1) + ' timeout, trying next...');
                            loadSource(index + 1);
                        }, 5000);

                        // Listen for iframe load
                        iframe.onload = () => {
                            clearTimeout(timeout);
                            console.log('Source ' + (index + 1) + ' loaded successfully');
                        };

                        iframe.onerror = () => {
                            clearTimeout(timeout);
                            console.log('Source ' + (index + 1) + ' failed, trying next...');
                            loadSource(index + 1);
                        };

                        document.getElementById('player').innerHTML = '';
                        document.getElementById('player').appendChild(iframe);
                    } else {
                        // For direct video sources
                        const videoSources = sources.filter(s => s.type !== 'iframe');
                        const art = new Artplayer({
                            container: '#player',
                            url: source.file,
                            quality: videoSources,
                            volume: 0.5,
                            isLive: false,
                            muted: false,
                            autoplay: false,
                            pip: true,
                            autoSize: true,
                            autoMini: true,
                            screenshot: true,
                            setting: true,
                            loop: false,
                            flip: true,
                            playbackRate: true,
                            aspectRatio: true,
                            fullscreen: true,
                            fullscreenWeb: true,
                            subtitleOffset: true,
                            miniProgressBar: true,
                            mutex: true,
                            backdrop: true,
                            playsInline: true,
                            autoPlayback: true,
                            airplay: true,
                            theme: '#ff0057',
                        });

                        art.on('error', () => {
                            console.log('Video source ' + (index + 1) + ' failed, trying next...');
                            loadSource(index + 1);
                        });
                    }
                }

                initPlayer();
            </script>
        </body>
        </html>
    `);
});

export default embed;
