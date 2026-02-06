import { Hono } from 'hono';
import { scrapeAnimeDetails, checkBatchAvailability } from '../scrapers/anime.js';

const anime = new Hono();

/**
 * GET /api/anime/:id
 * Get detailed anime/series information
 * Query params:
 *   - seasons: Filter by seasons - supports [1,2,3], [1-3], "all", or "latest"
 *   - season: Alias for seasons parameter
 * 
 * Examples:
 *   /api/anime/naruto?seasons=[1,2,3]
 *   /api/anime/naruto?seasons=[1-3]
 *   /api/anime/naruto?seasons=all
 *   /api/anime/naruto?seasons=latest
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

        // Get seasons query parameter (supports both 'seasons' and 'season')
        const seasonsQuery = c.req.query('seasons') || c.req.query('season');

        // Fetch anime details with optional seasons filtering
        const data = await scrapeAnimeDetails(id, seasonsQuery);
        
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
 * 
 * Request body:
 * {
 *   "ids": ["naruto", "one-piece", "bleach"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "results": [
 *     {
 *       "id": "naruto",
 *       "available": true,
 *       "totalEpisodes": 220,
 *       "totalSeasons": 4,
 *       "hasHindi": true
 *     },
 *     ...
 *   ]
 * }
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

        if (ids.length === 0) {
            return c.json({
                success: false,
                error: 'IDs array cannot be empty'
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

/**
 * GET /api/anime/:id/seasons
 * Get available seasons for an anime
 * 
 * Response:
 * {
 *   "success": true,
 *   "id": "naruto",
 *   "title": "Naruto",
 *   "totalSeasons": 4,
 *   "availableSeasons": [1, 2, 3, 4],
 *   "seasonInfo": {
 *     "1": { "episodes": 52, "year": "2002" },
 *     "2": { "episodes": 52, "year": "2003" },
 *     "3": { "episodes": 58, "year": "2004" },
 *     "4": { "episodes": 58, "year": "2005" }
 *   }
 * }
 */
anime.get('/:id/seasons', async (c) => {
    try {
        const id = c.req.param('id');

        if (!id) {
            return c.json({
                success: false,
                error: 'Anime ID is required'
            }, 400);
        }

        // Fetch full data to get season information
        const data = await scrapeAnimeDetails(id);

        if (!data.success) {
            return c.json(data, 500);
        }

        // Build season info
        const seasonInfo = {};
        Object.keys(data.seasons).forEach(seasonNum => {
            const episodes = data.seasons[seasonNum];
            seasonInfo[seasonNum] = {
                episodes: episodes.length,
                year: data.year || episodes[0]?.year || null
            };
        });

        return c.json({
            success: true,
            id: data.id,
            title: data.title,
            totalSeasons: data.totalSeasons,
            availableSeasons: data.availableSeasons,
            seasonInfo
        });
    } catch (error) {
        console.error('Seasons info route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

/**
 * GET /api/anime/:id/season/:seasonNumber
 * Get episodes for a specific season
 * 
 * Example: /api/anime/naruto/season/1
 * 
 * Response:
 * {
 *   "success": true,
 *   "id": "naruto",
 *   "title": "Naruto",
 *   "seasonNumber": 1,
 *   "totalEpisodes": 52,
 *   "episodes": [...]
 * }
 */
anime.get('/:id/season/:seasonNumber', async (c) => {
    try {
        const id = c.req.param('id');
        const seasonNumber = parseInt(c.req.param('seasonNumber'));

        if (!id) {
            return c.json({
                success: false,
                error: 'Anime ID is required'
            }, 400);
        }

        if (isNaN(seasonNumber) || seasonNumber < 1) {
            return c.json({
                success: false,
                error: 'Invalid season number. Must be a positive integer.'
            }, 400);
        }

        // Fetch only the requested season using seasons query
        const data = await scrapeAnimeDetails(id, `[${seasonNumber}]`);

        if (!data.success) {
            return c.json(data, 500);
        }

        // Check if the requested season exists
        if (!data.seasons[seasonNumber]) {
            return c.json({
                success: false,
                error: `Season ${seasonNumber} not found. Available seasons: ${data.availableSeasons.join(', ')}`
            }, 404);
        }

        return c.json({
            success: true,
            id: data.id,
            title: data.title,
            seasonNumber: seasonNumber,
            totalEpisodes: data.seasons[seasonNumber].length,
            episodes: data.seasons[seasonNumber]
        });
    } catch (error) {
        console.error('Season route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

export default anime;
