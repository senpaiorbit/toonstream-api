import { fetchPage, parseHTML, extractAnimeCard } from '../utils/scraper.js';
import { getCache, setCache } from '../utils/cache.js';

/**
 * Scrape weekly schedule
 * @returns {Promise<object>} Weekly schedule
 */
export const scrapeSchedule = async () => {
    const cacheKey = 'schedule:weekly';
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const html = await fetchPage('/');
        const $ = parseHTML(html);

        const schedule = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };

        // Try to find schedule section
        const scheduleSection = $('.schedule, #schedule, .weekly-schedule');

        if (scheduleSection.length > 0) {
            // Extract schedule by day
            Object.keys(schedule).forEach(day => {
                const daySection = scheduleSection.find(`[data-day="${day}"], .${day}, #${day}`);

                daySection.find('.item, article, .schedule-item').each((_, el) => {
                    const anime = extractAnimeCard($(el), $);
                    const time = $(el).find('.time, .release-time').text().trim() || null;

                    if (anime && anime.id) {
                        schedule[day].push({
                            ...anime,
                            releaseTime: time
                        });
                    }
                });
            });
        }

        const data = {
            success: true,
            schedule
        };

        setCache(cacheKey, data, 3600); // Cache for 1 hour
        return data;
    } catch (error) {
        console.error('Error scraping schedule:', error.message);
        throw new Error(`Failed to scrape schedule: ${error.message}`);
    }
};

/**
 * Scrape schedule for specific day
 * @param {string} day - Day of week
 * @returns {Promise<object>} Day schedule
 */
export const scrapeDaySchedule = async (day) => {
    const cacheKey = `schedule:${day}`;
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const weeklySchedule = await scrapeSchedule();
        const dayLower = day.toLowerCase();

        if (!weeklySchedule.schedule[dayLower]) {
            throw new Error(`Invalid day: ${day}`);
        }

        const data = {
            success: true,
            day: dayLower,
            animes: weeklySchedule.schedule[dayLower]
        };

        setCache(cacheKey, data, 3600);
        return data;
    } catch (error) {
        console.error('Error scraping day schedule:', error.message);
        throw new Error(`Failed to scrape day schedule: ${error.message}`);
    }
};

export default { scrapeSchedule, scrapeDaySchedule };
