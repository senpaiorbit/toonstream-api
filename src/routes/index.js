import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as cheerio from 'cheerio';

const app = new Hono();

// CORS middleware
app.use('/*', cors());

// Cache helper
const CACHE_DURATION = 3600; // 1 hour

// Helper function to fetch with error handling
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://toonstream.dad/',
          ...options.headers,
        },
      });
      
      if (!response.ok && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Helper to parse anime card
function parseAnimeCard($, element) {
  const $card = $(element);
  const title = $card.find('.film-name a').text().trim() || $card.find('a').attr('title')?.trim();
  const url = $card.find('.film-name a').attr('href') || $card.find('a').attr('href');
  const image = $card.find('img').attr('data-src') || $card.find('img').attr('src');
  const type = $card.find('.film-poster-quality').text().trim();
  const episodes = $card.find('.tick-item.tick-eps').text().trim();
  const sub = $card.find('.tick-item.tick-sub').text().trim();
  const dub = $card.find('.tick-item.tick-dub').text().trim();
  
  return {
    id: url?.split('/').filter(Boolean).pop(),
    title,
    url: url ? `https://toonstream.dad${url}` : null,
    image: image?.startsWith('http') ? image : image ? `https://toonstream.dad${image}` : null,
    type,
    episodes,
    sub,
    dub,
  };
}

// Root endpoint
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'ToonStream API - Cloudflare Workers',
    version: '1.0.0',
    endpoints: {
      home: '/home',
      search: '/search?q={query}',
      anime: '/anime/:id',
      episode: '/episode/:id',
      trending: '/trending',
      recent: '/recent',
      categories: '/categories',
      category: '/category/:name',
    },
    author: 'RY4N',
  });
});

// Home endpoint - Get homepage data
app.get('/home', async (c) => {
  try {
    const response = await fetchWithRetry('https://toonstream.dad/home');
    const html = await response.text();
    const $ = cheerio.load(html);

    const suggestions = [];
    $('.top-search .item').each((i, el) => {
      const title = $(el).text().trim();
      const url = $(el).attr('href');
      if (title && url) {
        suggestions.push({
          title,
          query: url.split('?s=')[1]?.replace(/\+/g, ' '),
          url,
        });
      }
    });

    const categories = [];
    $('.h-menu a').each((i, el) => {
      const name = $(el).text().trim();
      const url = $(el).attr('href');
      if (name && url) {
        categories.push({
          name,
          slug: url.split('/').filter(Boolean).pop(),
          url: `https://toonstream.dad${url}`,
        });
      }
    });

    return c.json({
      success: true,
      data: {
        suggestions,
        categories,
        siteUrl: 'https://toonstream.dad',
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Search endpoint
app.get('/search', async (c) => {
  try {
    const query = c.req.query('q');
    if (!query) {
      return c.json({
        success: false,
        error: 'Query parameter "q" is required',
      }, 400);
    }

    const page = c.req.query('page') || '1';
    const searchUrl = `https://toonstream.dad/home/?s=${encodeURIComponent(query)}&page=${page}`;
    
    const response = await fetchWithRetry(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    $('.film_list-wrap .flw-item, .film-list .film-poster').each((i, el) => {
      const anime = parseAnimeCard($, el);
      if (anime.title) results.push(anime);
    });

    return c.json({
      success: true,
      query,
      page: parseInt(page),
      results,
      totalResults: results.length,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Trending endpoint
app.get('/trending', async (c) => {
  try {
    const response = await fetchWithRetry('https://toonstream.dad/home');
    const html = await response.text();
    const $ = cheerio.load(html);

    const trending = [];
    $('#trending-home .flw-item, .trending .film-poster').each((i, el) => {
      const anime = parseAnimeCard($, el);
      if (anime.title) trending.push(anime);
    });

    return c.json({
      success: true,
      data: trending,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Recent episodes endpoint
app.get('/recent', async (c) => {
  try {
    const page = c.req.query('page') || '1';
    const response = await fetchWithRetry(`https://toonstream.dad/home?page=${page}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const recent = [];
    $('.film_list-wrap .flw-item, .recent .film-poster').each((i, el) => {
      const anime = parseAnimeCard($, el);
      if (anime.title) recent.push(anime);
    });

    return c.json({
      success: true,
      page: parseInt(page),
      data: recent,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Categories endpoint
app.get('/categories', async (c) => {
  try {
    const response = await fetchWithRetry('https://toonstream.dad/home');
    const html = await response.text();
    const $ = cheerio.load(html);

    const categories = [];
    $('.h-menu a, .genre-list a').each((i, el) => {
      const name = $(el).text().trim();
      const url = $(el).attr('href');
      if (name && url) {
        categories.push({
          name,
          slug: url.split('/').filter(Boolean).pop(),
          url: `https://toonstream.dad${url}`,
        });
      }
    });

    return c.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Category endpoint
app.get('/category/:name', async (c) => {
  try {
    const name = c.req.param('name');
    const page = c.req.query('page') || '1';
    
    const response = await fetchWithRetry(`https://toonstream.dad/category/${name}/?page=${page}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const anime = [];
    $('.film_list-wrap .flw-item, .film-list .film-poster').each((i, el) => {
      const item = parseAnimeCard($, el);
      if (item.title) anime.push(item);
    });

    return c.json({
      success: true,
      category: name,
      page: parseInt(page),
      data: anime,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Anime details endpoint
app.get('/anime/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const response = await fetchWithRetry(`https://toonstream.dad/anime/${id}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('.film-name, .anime-title, h1').first().text().trim();
    const image = $('.film-poster img').attr('data-src') || $('.film-poster img').attr('src');
    const description = $('.film-description, .description, .synopsis').text().trim();
    const type = $('.item-title:contains("Type")').next().text().trim();
    const status = $('.item-title:contains("Status")').next().text().trim();
    const genres = [];
    $('.item-list a[href*="/genre/"]').each((i, el) => {
      genres.push($(el).text().trim());
    });

    const episodes = [];
    $('.ss-list a, .episode-item a, .ep-item a').each((i, el) => {
      const $ep = $(el);
      const epTitle = $ep.attr('title') || $ep.text().trim();
      const epUrl = $ep.attr('href');
      const epNum = $ep.attr('data-number') || epTitle.match(/\d+/)?.[0];
      
      if (epUrl) {
        episodes.push({
          number: epNum || (i + 1).toString(),
          title: epTitle,
          id: epUrl.split('/').filter(Boolean).pop(),
          url: `https://toonstream.dad${epUrl}`,
        });
      }
    });

    return c.json({
      success: true,
      data: {
        id,
        title,
        image: image?.startsWith('http') ? image : image ? `https://toonstream.dad${image}` : null,
        description,
        type,
        status,
        genres,
        totalEpisodes: episodes.length,
        episodes,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Episode streaming endpoint
app.get('/episode/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const response = await fetchWithRetry(`https://toonstream.dad/watch/${id}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('.film-name, .episode-title, h1').first().text().trim();
    const episodeNumber = title.match(/Episode (\d+)/i)?.[1];
    
    const servers = [];
    $('.server-item, .anime_video_body_watch_items a').each((i, el) => {
      const $server = $(el);
      const serverName = $server.text().trim() || $server.attr('data-type');
      const serverId = $server.attr('data-id') || $server.attr('data-linkid');
      
      if (serverName && serverId) {
        servers.push({
          name: serverName,
          id: serverId,
        });
      }
    });

    // Try to extract video sources from iframe or embedded player
    const iframeSrc = $('iframe').attr('src');
    const videoSources = [];
    
    $('video source, .video-source').each((i, el) => {
      const src = $(el).attr('src');
      const quality = $(el).attr('data-quality') || $(el).attr('label') || 'default';
      if (src) {
        videoSources.push({
          url: src,
          quality,
          type: $(el).attr('type') || 'video/mp4',
        });
      }
    });

    // Extract download links
    const downloads = [];
    $('a[href*="download"], .download-link').each((i, el) => {
      const $dl = $(el);
      const quality = $dl.text().trim() || $dl.attr('data-quality');
      const url = $dl.attr('href');
      if (url) {
        downloads.push({
          quality,
          url,
        });
      }
    });

    return c.json({
      success: true,
      data: {
        id,
        title,
        episodeNumber,
        iframeSrc,
        servers,
        videoSources,
        downloads,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      '/home',
      '/search?q={query}',
      '/anime/:id',
      '/episode/:id',
      '/trending',
      '/recent',
      '/categories',
      '/category/:name',
    ],
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({
    success: false,
    error: err.message,
  }, 500);
});

export default app;
