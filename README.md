# ToonStream API

A comprehensive RESTful API for scraping anime content from [toonstream.love](https://toonstream.love). Built with Hono framework and Bun.js runtime.

[![Deploy on Pterodactyl](https://img.shields.io/badge/Deploy-Pterodactyl-blue)](./PTERODACTYL.md)

## Features

- 🎬 **Home Page Data** - Latest series, movies, and schedules
- 🔍 **Search** - Search anime with pagination and suggestions
- 📺 **Anime Details** - Comprehensive anime information with episodes
- 🎥 **Streaming Links** - Extract video sources and download links
- 🗂️ **Categories** - Browse by genre, language, type
- 📅 **Schedule** - Weekly anime release schedule
- ⚡ **Fast & Cached** - Built-in caching for optimal performance
- 🛡️ **Rate Limited** - Protection against abuse
- 📖 **API Documentation** - Interactive Swagger UI
- 🚀 **Pterodactyl Ready** - Optimized for panel deployment

## Quick Start

### Pterodactyl Deployment (Recommended)

See [PTERODACTYL.md](./PTERODACTYL.md) for complete deployment guide.

**Quick Steps:**
1. Import `egg.json` to your Pterodactyl panel
2. Create new server with ToonStream API egg
3. Start and access at `http://your-ip:3030`

### Local Development

1. **Install dependencies**

```bash
bun install
```

2. **Start development server**

```bash
bun run dev
```

The server will be running at `http://localhost:3030`

## API Endpoints

### Base URL
- **Production**: `https://your-app.vercel.app`
- **Local**: `http://localhost:3030`

### Endpoints

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/` | GET | API information | - |
| `/api/home` | GET | Homepage data | - |
| `/api/search` | GET | Search anime | `?keyword=naruto&page=1` |
| `/api/search/suggestions` | GET | Search suggestions | `?keyword=one` |
| `/api/anime/:id` | GET | Anime details | `/api/anime/bleach-dub` |
| `/api/episode/:id` | GET | Episode streaming | `/api/episode/bleach-dub-2x1` |
| `/api/episode/:id/servers/:serverId` | GET | Server-specific link | - |
| `/api/categories` | GET | All categories | - |
| `/api/category/:name` | GET | Category anime | `?page=1` |
| `/api/category/language/:lang` | GET | By language | `/language/hindi` |
| `/api/category/type/movies` | GET | Movies | - |
| `/api/category/type/series` | GET | Series | - |
| `/api/schedule` | GET | Weekly schedule | - |
| `/api/schedule/:day` | GET | Day schedule | `/schedule/monday` |

## Usage Examples

### JavaScript/TypeScript

```javascript
// Search for anime
const response = await fetch('https://your-app.vercel.app/api/search?keyword=naruto');
const data = await response.json();
console.log(data.results);

// Get anime details
const anime = await fetch('https://your-app.vercel.app/api/anime/bleach-dub');
const details = await anime.json();
console.log(details.totalEpisodes); // 40

// Get episode streaming
const episode = await fetch('https://your-app.vercel.app/api/episode/bleach-dub-2x1');
const streaming = await episode.json();
console.log(streaming.sources); // Array of streaming URLs
```

### Python

```python
import requests

# Search
response = requests.get('https://your-app.vercel.app/api/search', 
                       params={'keyword': 'naruto'})
print(response.json())

# Get anime
anime = requests.get('https://your-app.vercel.app/api/anime/bleach-dub')
print(anime.json()['totalEpisodes'])
```

### cURL

```bash
# Home page
curl https://your-app.vercel.app/api/home

# Search
curl "https://your-app.vercel.app/api/search?keyword=bleach"

# Anime details
curl https://your-app.vercel.app/api/anime/hunter-x-hunter-hindi-dub

# Episode streaming
curl https://your-app.vercel.app/api/episode/hunter-x-hunter-hindi-dub-1x17
```

## Response Examples

### Search Response

```json
{
  "success": true,
  "keyword": "bleach",
  "results": [
    {
      "id": "bleach-dub",
      "title": "Bleach Dub",
      "url": "https://toonstream.love/series/bleach-dub/",
      "poster": "https://image.tmdb.org/t/p/w500/vdWSv1yyqQLz9POkbUyKEmAkJOM.jpg",
      "type": "Series"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "hasNextPage": false
  }
}
```

### Anime Details Response

```json
{
  "success": true,
  "id": "bleach-dub",
  "title": "Bleach Dub",
  "poster": "https://image.tmdb.org/t/p/w185/vdWSv1yyqQLz9POkbUyKEmAkJOM.jpg",
  "description": "For as long as he can remember...",
  "genres": ["Action & Adventure", "Animation", "Sci-Fi & Fantasy"],
  "languages": ["Hindi", "Tamil", "Telugu", "English", "Japanese"],
  "totalEpisodes": 40,
  "seasons": {
    "season2": [...]
  }
}
```

### Episode Streaming Response

```json
{
  "success": true,
  "episodeId": "bleach-dub-2x1",
  "title": "Bleach Dub 2x1",
  "season": 2,
  "episode": 1,
  "sources": [
    {
      "type": "iframe",
      "url": "https://toonstream.love/?trembed=0&trid=33881&trtype=2",
      "quality": "default"
    }
  ],
  "languages": ["Hindi", "Tamil", "Telugu", "English", "Japanese"]
}
```

## Configuration

The API uses `config.js` for configuration:

```javascript
export default {
  port: 3030,
  baseUrl: 'https://toonstream.love',
  cacheTTL: 3600,
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100
  }
};
```

## Deployment

### Vercel (Recommended)

1. Fork this repository
2. Import to Vercel
3. Deploy!

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t toonstream-api .
docker run -p 3030:3030 toonstream-api
```

### Other Platforms

- **Render**: Set build command to `npm install` and start command to `npm start`
- **Railway**: One-click deployment
- **Fly.io**: Global edge deployment

## Project Structure

```
toonstream-api/
├── config.js              # Configuration
├── index.js               # Main application
├── vercel.json           # Vercel configuration
├── src/
│   ├── routes/           # API route handlers
│   │   ├── home.js
│   │   ├── search.js
│   │   ├── anime.js
│   │   ├── episodes.js
│   │   ├── categories.js
│   │   └── schedule.js
│   ├── scrapers/         # Web scrapers
│   │   ├── home.js
│   │   ├── search.js
│   │   ├── anime.js
│   │   ├── streaming.js
│   │   ├── categories.js
│   │   └── schedule.js
│   └── utils/
│       ├── scraper.js    # Scraping utilities
│       └── cache.js      # Caching system
├── package.json
└── README.md
```

## Technologies

- **Runtime**: Node.js 18+ / Bun.js
- **Framework**: [Hono](https://hono.dev) - Fast web framework
- **Scraping**: [Cheerio](https://cheerio.js.org) - HTML parsing
- **HTTP**: Native Fetch API
- **Caching**: node-cache
- **Documentation**: Swagger UI

## Performance

- ⚡ Fast response times with caching
- 🔄 30-minute cache for home page
- 🔄 1-hour cache for anime details
- 🔄 10-minute cache for search results
- 🚀 Optimized for serverless environments

## Rate Limiting

- 100 requests per minute per IP
- Configurable via `config.js`

## Important Notice

> **⚠️ Disclaimer**: This API is for educational purposes only. Web scraping may violate the website's Terms of Service. Use responsibly and at your own risk.

## API Documentation

Interactive API documentation is available at `/docs` when running the server.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Inspired by [hianime-api](https://github.com/ryanwtf88/hianime-api)
- Built with [Hono](https://hono.dev)
- Scraping powered by [Cheerio](https://cheerio.js.org)
