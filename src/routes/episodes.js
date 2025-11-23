import { Hono } from 'hono';
import { scrapeEpisodeStreaming, scrapeServerLink } from '../scrapers/streaming.js';

const episodes = new Hono();

/**
 * GET /api/episode/:id
 * Get episode details and streaming information
 */
episodes.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');

        if (!id) {
            return c.json({
                success: false,
                error: 'Episode ID is required'
            }, 400);
        }

        const data = await scrapeEpisodeStreaming(id);
        return c.json(data);
    } catch (error) {
        console.error('Episode route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

/**
 * GET /api/episode/:id/servers/:serverId
 * Get streaming link from specific server
 */
episodes.get('/:id/servers/:serverId', async (c) => {
    try {
        const id = c.req.param('id');
        const serverId = c.req.param('serverId');

        if (!id || !serverId) {
            return c.json({
                success: false,
                error: 'Episode ID and Server ID are required'
            }, 400);
        }

        const data = await scrapeServerLink(id, serverId);
        return c.json(data);
    } catch (error) {
        console.error('Server link route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

export default episodes;
