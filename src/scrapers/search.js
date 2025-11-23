import { fetchPage, parseHTML, extractAnimeCard, extractPagination } from '../utils/scraper.js';
import { getCache, setCache } from '../utils/cache.js';

/**
 * Search for anime/series
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number
 * @returns {Promise<object>} Search results
 */
export const scrapeSearch = async (keyword, page = 1) => {
    const cacheKey = `search:${keyword}:${page}`;
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const searchUrl = `/?s=${encodeURIComponent(keyword)}${page > 1 ? `&paged=${page}` : ''}`;
        const html = await fetchPage(searchUrl);
        const $ = parseHTML(html);

        const results = [];
        const processedIds = new Set();

        // Target only actual content items, not navigation or categories
        const contentSelectors = [
            'article.item',
            'article.post',
            '.search-page article',
            '.result article',
            'div.item:has(a[href*="/series/"]), div.item:has(a[href*="/movies/"])',
            'article:has(a[href*="/series/"]), article:has(a[href*="/movies/"])'
        ];

        contentSelectors.forEach(selector => {
            $(selector).each((_, el) => {
                const anime = extractAnimeCard($(el), $);
                if (anime && anime.id && !processedIds.has(anime.id)) {
                    processedIds.add(anime.id);

                    // Extract additional metadata
                    const typeEl = $(el).find('.type, .category, [class*="type"]');
                    const type = typeEl.text().trim() ||
                        (anime.url.includes('/series/') ? 'Series' :
                            anime.url.includes('/movie') ? 'Movie' : 'Unknown');

                    const descEl = $(el).find('.description, .excerpt, .summary, p').first();
                    let description = descEl.text().trim() || null;

                    // Clean description
                    if (description && description.length > 200) {
                        description = description.substring(0, 200) + '...';
                    }

                    results.push({
                        ...anime,
                        type,
                        description
                    });
                }
            });
        });

        const pagination = extractPagination($);

        const data = {
            success: true,
            keyword,
            results,
            pagination
        };

        setCache(cacheKey, data, 600); // Cache for 10 minutes
        return data;
    } catch (error) {
        console.error('Error scraping search:', error.message);
        throw new Error(`Failed to search: ${error.message}`);
    }
};

/**
 * Get search suggestions
 * @param {string} keyword - Search keyword
 * @returns {Promise<object>} Search suggestions
 */
export const scrapeSearchSuggestions = async (keyword) => {
    const cacheKey = `suggestions:${keyword}`;
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const searchData = await scrapeSearch(keyword, 1);

        const suggestions = searchData.results.slice(0, 10).map(item => ({
            id: item.id,
            title: item.title,
            poster: item.poster,
            type: item.type
        }));

        const data = {
            success: true,
            keyword,
            suggestions
        };

        setCache(cacheKey, data, 600);
        return data;
    } catch (error) {
        console.error('Error scraping search suggestions:', error.message);
        throw new Error(`Failed to get suggestions: ${error.message}`);
    }
};

export default { scrapeSearch, scrapeSearchSuggestions };
