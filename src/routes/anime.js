import { Hono } from 'hono';
import { scrapeAnimeDetails, checkBatchAvailability } from '../scrapers/anime.js';

const anime = new Hono();

/**
 * GET /api/anime/:id
 * Get detailed anime/series information
 */
anime.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');

        if (!id) {
            return c.json({
                success: false,
                error: 'Anime ID is required'
            }, 400);
        }

        const data = await scrapeAnimeDetails(id);
        return c.json(data);
    } catch (error) {
        console.error('Anime route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

/**
 * POST /api/anime/batch-availability
 * Check availability for multiple anime
 */
anime.post('/batch-availability', async (c) => {
    try {
        const { ids } = await c.req.json();

        if (!ids || !Array.isArray(ids)) {
            return c.json({
                success: false,
                error: 'IDs array is required'
            }, 400);
        }

        if (ids.length > 50) {
            return c.json({
                success: false,
                error: 'Too many IDs. Maximum is 50.'
            }, 400);
        }

        const data = await checkBatchAvailability(ids);
        return c.json(data);
    } catch (error) {
        console.error('Batch availability route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

export default anime;
