import { fetchPage, parseHTML, extractAnimeCard } from '../utils/scraper.js';
import { getCache, setCache } from '../utils/cache.js';

/**
 * Scrape homepage data
 * @returns {Promise<object>} Homepage data
 */
export const scrapeHome = async () => {
    const cacheKey = 'home';
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const html = await fetchPage('/');
        const $ = parseHTML(html);

        const data = {
            latestSeries: [],
            latestMovies: [],
            trending: [],
            schedule: {}
        };

        // Target specific content sections, avoiding navigation/menu items
        const contentSelectors = [
            'article.item',
            'article.post',
            '.items article',
            '.movies-list article',
            'div.item',
            '.content article'
        ];

        const processedIds = new Set();

        contentSelectors.forEach(selector => {
            $(selector).each((_, el) => {
                const anime = extractAnimeCard($(el), $);
                if (anime && anime.id && !processedIds.has(anime.id)) {
                    processedIds.add(anime.id);

                    // Categorize based on URL pattern
                    if (anime.url.includes('/series/')) {
                        if (data.latestSeries.length < 20) {
                            data.latestSeries.push(anime);
                        }
                    } else if (anime.url.includes('/movies/') || anime.url.includes('/movie/')) {
                        if (data.latestMovies.length < 20) {
                            data.latestMovies.push(anime);
                        }
                    }
                }
            });
        });

        // Extract schedule if available
        const scheduleSection = $('.schedule, #schedule, [class*="schedule"]');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        days.forEach(day => {
            const daySection = scheduleSection.find(`[data-day="${day}"], .${day}, #${day}`);
            const dayAnimes = [];

            daySection.find('article, .item, .post').each((_, el) => {
                const anime = extractAnimeCard($(el), $);
                if (anime && anime.id) {
                    const time = $(el).find('.time, .release-time').text().trim();
                    dayAnimes.push({
                        ...anime,
                        releaseTime: time || null
                    });
                }
            });

            if (dayAnimes.length > 0) {
                data.schedule[day] = dayAnimes;
            }
        });

        setCache(cacheKey, data, 1800); // Cache for 30 minutes
        return data;
    } catch (error) {
        console.error('Error scraping home:', error.message);
        throw new Error(`Failed to scrape home page: ${error.message}`);
    }
};

export default { scrapeHome };
