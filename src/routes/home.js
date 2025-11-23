import { Hono } from 'hono';
import { scrapeHome } from '../scrapers/home.js';

const home = new Hono();

/**
 * GET /api/home
 * Get homepage data including latest series, movies, and schedule
 */
home.get('/', async (c) => {
    try {
        const data = await scrapeHome();
        return c.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Home route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

export default home;
