import { fetchPage, parseHTML, extractAnimeCard, extractPagination } from '../utils/scraper.js';
import { getCache, setCache } from '../utils/cache.js';

/**
 * Scrape anime by category
 * @param {string} category - Category slug
 * @param {number} page - Page number
 * @returns {Promise<object>} Category data
 */
export const scrapeCategory = async (category, page = 1) => {
    const cacheKey = `category:${category}:${page}`;
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const url = `/category/${category}/page/${page}/`;
        const html = await fetchPage(url);
        const $ = parseHTML(html);

        const animes = [];

        $('article, .movie-item, .item, .post').each((_, el) => {
            const anime = extractAnimeCard($(el), $);
            if (anime && anime.id) {
                animes.push(anime);
            }
        });

        const pagination = extractPagination($);
        const categoryName = $('.page-title, h1').first().text().trim() || category;

        const data = {
            success: true,
            category,
            categoryName,
            animes,
            pagination
        };

        setCache(cacheKey, data, 1800); // Cache for 30 minutes
        return data;
    } catch (error) {
        console.error('Error scraping category:', error.message);
        throw new Error(`Failed to scrape category: ${error.message}`);
    }
};

/**
 * Get all available categories
 * @returns {Promise<object>} Categories list
 */
export const scrapeCategories = async () => {
    const cacheKey = 'categories:all';
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const html = await fetchPage('/');
        const $ = parseHTML(html);

        const categories = [];

        // Extract from navigation menu
        $('nav a[href*="/category/"], .menu a[href*="/category/"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const name = $(el).text().trim();
            const slug = href.split('/category/')[1]?.split('/')[0];

            if (slug && name) {
                categories.push({
                    slug,
                    name,
                    url: href
                });
            }
        });

        // Extract from footer or sidebar
        $('.widget_categories a, .categories a').each((_, el) => {
            const href = $(el).attr('href') || '';
            const name = $(el).text().trim();
            const slug = href.split('/category/')[1]?.split('/')[0];

            if (slug && name && !categories.find(c => c.slug === slug)) {
                categories.push({
                    slug,
                    name,
                    url: href
                });
            }
        });

        const data = {
            success: true,
            categories
        };

        setCache(cacheKey, data, 7200); // Cache for 2 hours
        return data;
    } catch (error) {
        console.error('Error scraping categories:', error.message);
        throw new Error(`Failed to scrape categories: ${error.message}`);
    }
};

/**
 * Scrape anime by language
 * @param {string} language - Language (hindi, tamil, telugu, english)
 * @param {number} page - Page number
 * @returns {Promise<object>} Language filtered data
 */
export const scrapeByLanguage = async (language, page = 1) => {
    const cacheKey = `language:${language}:${page}`;
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        // Language categories on toonstream
        const languageMap = {
            'hindi': 'hindi-language',
            'tamil': 'tamil',
            'telugu': 'telugu',
            'english': 'english'
        };

        const categorySlug = languageMap[language.toLowerCase()] || language;
        return await scrapeCategory(categorySlug, page);
    } catch (error) {
        console.error('Error scraping by language:', error.message);
        throw new Error(`Failed to scrape by language: ${error.message}`);
    }
};

/**
 * Scrape movies
 * @param {number} page - Page number
 * @returns {Promise<object>} Movies data
 */
export const scrapeMovies = async (page = 1) => {
    return await scrapeCategory('anime-movies', page);
};

/**
 * Scrape series
 * @param {number} page - Page number
 * @returns {Promise<object>} Series data
 */
export const scrapeSeries = async (page = 1) => {
    return await scrapeCategory('anime-series', page);
};

export default {
    scrapeCategory,
    scrapeCategories,
    scrapeByLanguage,
    scrapeMovies,
    scrapeSeries
};
