import { Hono } from 'hono';
import { scrapeSearch, scrapeSearchSuggestions } from '../scrapers/search.js';

const search = new Hono();

/**
 * GET /api/search?keyword={query}&page={page}
 * Search for anime/series
 */
search.get('/', async (c) => {
    try {
        const keyword = c.req.query('keyword') || c.req.query('q');
        const page = parseInt(c.req.query('page')) || 1;

        if (!keyword) {
            return c.json({
                success: false,
                error: 'Keyword parameter is required'
            }, 400);
        }

        const data = await scrapeSearch(keyword, page);
        return c.json(data);
    } catch (error) {
        console.error('Search route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

/**
 * GET /api/search/suggestions?keyword={query}
 * Get search suggestions
 */
search.get('/suggestions', async (c) => {
    try {
        const keyword = c.req.query('keyword') || c.req.query('q');

        if (!keyword) {
            return c.json({
                success: false,
                error: 'Keyword parameter is required'
            }, 400);
        }

        const data = await scrapeSearchSuggestions(keyword);
        return c.json(data);
    } catch (error) {
        console.error('Search suggestions route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

export default search;
