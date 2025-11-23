import { Hono } from 'hono';
import { scrapeSchedule, scrapeDaySchedule } from '../scrapers/schedule.js';

const schedule = new Hono();

/**
 * GET /api/schedule
 * Get weekly anime release schedule
 */
schedule.get('/', async (c) => {
    try {
        const data = await scrapeSchedule();
        return c.json(data);
    } catch (error) {
        console.error('Schedule route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

/**
 * GET /api/schedule/:day
 * Get schedule for specific day
 */
schedule.get('/:day', async (c) => {
    try {
        const day = c.req.param('day');

        if (!day) {
            return c.json({
                success: false,
                error: 'Day is required'
            }, 400);
        }

        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (!validDays.includes(day.toLowerCase())) {
            return c.json({
                success: false,
                error: 'Invalid day. Must be one of: ' + validDays.join(', ')
            }, 400);
        }

        const data = await scrapeDaySchedule(day);
        return c.json(data);
    } catch (error) {
        console.error('Day schedule route error:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

export default schedule;
