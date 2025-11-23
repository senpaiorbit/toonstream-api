import { Hono } from 'hono';
import { scrapeAnimeDetails } from '../scrapers/anime.js';

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

export default anime;
