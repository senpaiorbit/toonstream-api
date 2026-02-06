import { fetchPage, parseHTML, extractEpisodeInfo, cleanText } from '../utils/scraper.js';
import { getCache, setCache } from '../utils/cache.js';

/**
 * Parse seasons query parameter - supports [1,2,3], [1-3], "all", or "latest"
 * @param {string} seasonsParam - Seasons query string
 * @returns {string|number[]} - "all", "latest", or array of season numbers
 */
const parseSeasons = (seasonsParam) => {
    if (!seasonsParam) return null; // Return all available seasons by default
    
    // Remove brackets if present
    let cleaned = seasonsParam.trim();
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        cleaned = cleaned.slice(1, -1);
    }
    
    if (cleaned.toLowerCase() === 'all') {
        return 'all';
    }
    
    if (cleaned.toLowerCase() === 'latest') {
        return 'latest';
    }
    
    const seasons = [];
    const parts = cleaned.split(',');
    
    for (const part of parts) {
        const trimmed = part.trim();
        
        // Range: 1-3
        if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (!seasons.includes(i)) seasons.push(i);
                }
            }
        }
        // Single number: 1, 2, 3
        else {
            const num = parseInt(trimmed);
            if (!isNaN(num) && !seasons.includes(num)) {
                seasons.push(num);
            }
        }
    }
    
    return seasons.sort((a, b) => a - b);
};

/**
 * Filter seasons based on query
 * @param {object} allSeasons - All available seasons object
 * @param {string|number[]} seasonsQuery - Parsed seasons query
 * @returns {object} - Filtered seasons object
 */
const filterSeasons = (allSeasons, seasonsQuery) => {
    if (!seasonsQuery) {
        // No query provided, return all seasons
        return allSeasons;
    }
    
    const seasonNumbers = Object.keys(allSeasons).map(n => parseInt(n)).sort((a, b) => a - b);
    
    if (seasonsQuery === 'all') {
        return allSeasons;
    }
    
    if (seasonsQuery === 'latest') {
        // Return only the highest season number
        const latestSeason = Math.max(...seasonNumbers);
        return { [latestSeason]: allSeasons[latestSeason] };
    }
    
    // Filter specific seasons
    const filtered = {};
    seasonsQuery.forEach(seasonNum => {
        if (allSeasons[seasonNum]) {
            filtered[seasonNum] = allSeasons[seasonNum];
        }
    });
    
    return filtered;
};

/**
 * Extract anime card data from element
 * @param {object} $el - Cheerio element
 * @param {object} $ - Cheerio instance
 * @returns {object|null} - Anime card data
 */
const extractAnimeCard = ($el, $) => {
    try {
        const link = $el.find('a[href*="/series/"], a[href*="/movies/"]').first();
        const href = link.attr('href');
        
        if (!href) return null;
        
        const id = href.split('/').filter(Boolean).pop();
        const title = link.attr('title') || $el.find('.title, h2, h3').first().text().trim();
        
        let poster = $el.find('img').first().attr('src') || 
                     $el.find('img').first().attr('data-src') || '';
        if (poster && !poster.startsWith('http')) {
            poster = poster.startsWith('//') ? `https:${poster}` : `https://toonstream.one${poster}`;
        }
        
        const ratingEl = $el.find('.rating, .vote, .tmdb');
        const rating = parseFloat(ratingEl.text().match(/[\d.]+/)?.[0]) || null;
        
        return {
            id,
            title,
            poster,
            rating,
            url: href
        };
    } catch (error) {
        return null;
    }
};

/**
 * Scrape anime/series details with optional seasons filtering
 * @param {string} id - Anime ID/slug
 * @param {string} seasonsQuery - Optional seasons query parameter
 * @returns {Promise<object>} Anime details
 */
export const scrapeAnimeDetails = async (id, seasonsQuery = null) => {
    const parsedSeasons = parseSeasons(seasonsQuery);
    
    // Create cache key that includes seasons query
    const cacheKey = seasonsQuery 
        ? `anime:${id}:seasons:${seasonsQuery}`
        : `anime:${id}`;
    
    const cached = getCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        // Try multiple URL patterns to handle both series and movies
        let html;
        let url;
        let lastError;

        // First try as a series
        try {
            url = `/series/${id}/`;
            html = await fetchPage(url);
        } catch (error) {
            lastError = error;
            // If series fails with 404, try as a movie
            if (error.message.includes('404')) {
                url = `/movies/${id}/`;
                html = await fetchPage(url);
                lastError = null; // Success!
            } else {
                // If it's not a 404, throw the original error
                throw error;
            }
        }

        const $ = parseHTML(html);

        // Extract basic info
        const title = $('h1, .entry-title, .title, [class*="title"]').first().text().trim() ||
            id.replace(/-/g, ' ');

        const posterEl = $('.poster img, .thumbnail img, article img, [class*="poster"] img').first();
        let poster = posterEl.attr('src') || posterEl.attr('data-src') || posterEl.attr('data-lazy-src') || '';
        if (poster && !poster.startsWith('http')) {
            poster = poster.startsWith('//') ? `https:${poster}` : `https://toonstream.one${poster}`;
        }

        // Extract description/synopsis
        const descEl = $('.description, .synopsis, .entry-content, [class*="description"]');
        let description = '';
        descEl.find('p').each((_, p) => {
            const text = $(p).text().trim();
            if (text && text.length > 20) {
                description += text + ' ';
            }
        });
        description = cleanText(description);

        // Extract metadata
        const ratingEl = $('.rating, .tmdb, .imdb, [class*="rating"]');
        const ratingText = ratingEl.text();
        const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0]) || null;

        const qualityEl = $('.quality, [class*="quality"]');
        const quality = qualityEl.text().trim() || null;

        const runtimeEl = $('.runtime, .duration, [class*="runtime"]');
        const runtime = runtimeEl.text().trim() || null;

        // Extract genres/categories
        const genres = [];
        $('[rel="category tag"], .genres a, .category a, [class*="genre"] a').each((_, el) => {
            const genre = $(el).text().trim();
            if (genre && !genres.includes(genre) && genre.length < 50) {
                genres.push(genre);
            }
        });

        // Extract languages
        const languages = [];
        const pageText = $('body').text();
        const langMatches = pageText.match(/Hindi|Tamil|Telugu|English|Japanese|Urdu|Malayalam|Kannada|Bengali|Marathi/gi) || [];
        langMatches.forEach(lang => {
            const normalized = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
            if (!languages.includes(normalized)) {
                languages.push(normalized);
            }
        });

        // Extract cast
        const cast = [];
        $('[href*="/cast_tv/"], .cast a').each((_, el) => {
            const member = $(el).text().trim();
            if (member && !cast.includes(member) && member.length < 50) {
                cast.push(member);
            }
        });

        // Extract related content
        const related = [];
        $('.related-posts article, .related-movies article, .related article, [class*="related"] article').each((_, el) => {
            const anime = extractAnimeCard($(el), $);
            if (anime && anime.id) {
                related.push(anime);
            }
        });

        // Extract episodes by season
        const allSeasons = {};
        let allEpisodes = [];

        // Look for season containers
        $('[class*="season"], .episodes-list, [id*="season"]').each((_, seasonEl) => {
            const seasonText = $(seasonEl).find('[class*="season-title"], h2, h3').first().text();
            const seasonMatch = seasonText.match(/season\s*(\d+)/i);
            const seasonNum = seasonMatch ? parseInt(seasonMatch[1]) : 1;

            const episodes = [];
            $(seasonEl).find('a[href*="/episode/"]').each((_, el) => {
                // Pass the container element (li or div) if the link is inside it
                const container = $(el).closest('li, .episode-item');
                const elementToParse = container.length ? container : $(el).parent();

                const episode = extractEpisodeInfo(elementToParse, $);
                if (episode && episode.id) {
                    // Force season number if we found it in the container
                    if (!episode.season || episode.season === 1) {
                        episode.season = seasonNum;
                    }
                    episodes.push(episode);
                    allEpisodes.push(episode);
                }
            });

            if (episodes.length > 0) {
                allSeasons[seasonNum] = episodes;
            }
        });

        // If no seasons found via containers, try to get all episode links and group them
        if (Object.keys(allSeasons).length === 0) {
            $('a[href*="/episode/"]').each((_, el) => {
                const container = $(el).closest('li, .episode-item');
                const elementToParse = container.length ? container : $(el).parent();

                const episode = extractEpisodeInfo(elementToParse, $);
                if (episode && episode.id) {
                    allEpisodes.push(episode);
                }
            });

            // Group by season number
            allEpisodes.forEach(ep => {
                const seasonNum = ep.season || 1;
                if (!allSeasons[seasonNum]) {
                    allSeasons[seasonNum] = [];
                }
                allSeasons[seasonNum].push(ep);
            });
        }

        // Filter seasons based on query
        const filteredSeasons = filterSeasons(allSeasons, parsedSeasons);
        
        // Calculate total episodes from filtered seasons
        const filteredEpisodes = Object.values(filteredSeasons).flat();
        
        // Get available seasons info
        const availableSeasons = Object.keys(allSeasons)
            .map(n => parseInt(n))
            .sort((a, b) => a - b);
        
        const requestedSeasons = parsedSeasons === 'all' 
            ? availableSeasons 
            : parsedSeasons === 'latest'
            ? [Math.max(...availableSeasons)]
            : parsedSeasons || availableSeasons;

        const data = {
            success: true,
            id,
            title,
            poster,
            description,
            rating,
            quality,
            runtime,
            genres,
            languages,
            cast,
            totalEpisodes: allEpisodes.length,
            totalSeasons: availableSeasons.length,
            availableSeasons,
            requestedSeasons: Array.isArray(requestedSeasons) ? requestedSeasons : requestedSeasons,
            seasons: filteredSeasons,
            filteredEpisodes: filteredEpisodes.length,
            related
        };

        setCache(cacheKey, data, 3600); // Cache for 1 hour
        return data;
    } catch (error) {
        console.error('Error scraping anime details:', error.message);
        throw new Error(`Failed to scrape anime details: ${error.message}`);
    }
};

/**
 * Check availability for multiple anime
 * @param {string[]} ids - Array of anime IDs
 * @returns {Promise<object>} Availability data
 */
export const checkBatchAvailability = async (ids) => {
    try {
        const promises = ids.map(async (id) => {
            try {
                const data = await scrapeAnimeDetails(id);
                return {
                    id,
                    available: true,
                    totalEpisodes: data.totalEpisodes,
                    totalSeasons: data.totalSeasons,
                    hasHindi: data.languages.includes('Hindi')
                };
            } catch (error) {
                return {
                    id,
                    available: false,
                    error: error.message
                };
            }
        });

        const results = await Promise.all(promises);
        return {
            success: true,
            results
        };
    } catch (error) {
        console.error('Error checking batch availability:', error.message);
        throw new Error(`Failed to check batch availability: ${error.message}`);
    }
};

export default { scrapeAnimeDetails, checkBatchAvailability };
