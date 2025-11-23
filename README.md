# ToonStream API

A comprehensive RESTful API for scraping anime content from [toonstream.love](https://toonstream.love). Built with Bun.js and Hono framework, following the architecture of [hianime-api](https://github.com/ryanwtf88/hianime-api).

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

## Table of Contents

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Deployment](#deployment)
- [Development](#development)

## Installation

### Prerequisites

Make sure you have [Bun.js](https://bun.sh) installed on your system.

```bash
curl -fsSL https://bun.sh/install | bash
```

### Local Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd toonstream-api
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment** (optional)

Copy `.env.example` to `.env` and adjust settings:

```bash
cp .env.example .env
```

4. **Start the development server**

```bash
bun run dev
```

The server will be running at `http://localhost:3030`

## API Endpoints

### 1. GET Home Page

Retrieve homepage data including latest series, movies, and schedule.

```
GET /api/v1/home
```

**Response:**
```json
{
  "success": true,
  "data": {
    "latestSeries": [...],
    "latestMovies": [...],
    "randomSeries": [...],
    "randomMovies": [...],
    "schedule": {...}
  }
}
```

### 2. GET Search

Search for anime/series by keyword.

```
GET /api/v1/search?keyword={query}&page={page}
```

**Parameters:**
- `keyword` (required) - Search query
- `page` (optional) - Page number (default: 1)

**Example:**
```bash
curl "http://localhost:3030/api/v1/search?keyword=hunter&page=1"
```

### 3. GET Search Suggestions

Get quick search suggestions.

```
GET /api/v1/search/suggestions?keyword={query}
```

### 4. GET Anime Details

Retrieve detailed information about a specific anime.

```
GET /api/v1/anime/{id}
```

**Example:**
```bash
curl "http://localhost:3030/api/v1/anime/hunter-x-hunter-hindi-dub"
```

**Response:**
```json
{
  "success": true,
  "id": "hunter-x-hunter-hindi-dub",
  "title": "Hunter x Hunter Hindi Dub",
  "poster": "...",
  "description": "...",
  "rating": 8.6,
  "genres": ["Action & Adventure", "Animation"],
  "languages": ["Hindi", "English", "Japanese"],
  "totalEpisodes": 148,
  "seasons": {...}
}
```

### 5. GET Episode Streaming

Get episode details and streaming links.

```
GET /api/v1/episode/{episodeId}
```

**Example:**
```bash
curl "http://localhost:3030/api/v1/episode/hunter-x-hunter-hindi-dub-1x1"
```

### 6. GET Episode Server

Get streaming link from specific server.

```
GET /api/v1/episode/{episodeId}/servers/{serverId}
```

### 7. GET Categories

Get all available categories.

```
GET /api/v1/categories
```

### 8. GET Category

Get anime by category with pagination.

```
GET /api/v1/category/{name}?page={page}
```

**Example:**
```bash
curl "http://localhost:3030/api/v1/category/action-adventure?page=1"
```

### 9. GET By Language

Filter anime by language.

```
GET /api/v1/category/language/{lang}?page={page}
```

**Supported languages:** `hindi`, `tamil`, `telugu`, `english`

**Example:**
```bash
curl "http://localhost:3030/api/v1/category/language/hindi?page=1"
```

### 10. GET Movies

Get anime movies.

```
GET /api/v1/category/type/movies?page={page}
```

### 11. GET Series

Get anime series.

```
GET /api/v1/category/type/series?page={page}
```

### 12. GET Schedule

Get weekly anime release schedule.

```
GET /api/v1/schedule
```

### 13. GET Day Schedule

Get schedule for specific day.

```
GET /api/v1/schedule/{day}
```

**Valid days:** `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`

## Usage Examples

### JavaScript/Node.js

```javascript
// Get home page data
const response = await fetch('http://localhost:3030/api/v1/home');
const data = await response.json();
console.log(data);

// Search for anime
const searchResponse = await fetch('http://localhost:3030/api/v1/search?keyword=naruto&page=1');
const searchData = await searchResponse.json();
console.log(searchData.results);

// Get anime details
const animeResponse = await fetch('http://localhost:3030/api/v1/anime/hunter-x-hunter-hindi-dub');
const animeData = await animeResponse.json();
console.log(animeData);
```

### Python

```python
import requests

# Get home page data
response = requests.get('http://localhost:3030/api/v1/home')
data = response.json()
print(data)

# Search for anime
search_response = requests.get('http://localhost:3030/api/v1/search', params={
    'keyword': 'naruto',
    'page': 1
})
search_data = search_response.json()
print(search_data['results'])
```

## Deployment

### Docker Deployment

1. **Build the Docker image**

```bash
docker build -t toonstream-api .
```

2. **Run the container**

```bash
docker run -p 3030:3030 -e PORT=3030 toonstream-api
```

### Render Deployment

1. Create a new Web Service on [Render](https://render.com)
2. Connect your repository
3. Set build command: `bun install`
4. Set start command: `bun start`
5. Deploy!

### Vercel Deployment

This API can be deployed to Vercel with minimal configuration. Create a `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

## Development

### Running in Development Mode

```bash
bun run dev
```

This will start the server with hot-reload enabled.

### Running in Production Mode

```bash
bun start
```

### Project Structure

```
toonstream-api/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── home.js
│   │   ├── search.js
│   │   ├── anime.js
│   │   ├── episodes.js
│   │   ├── categories.js
│   │   └── schedule.js
│   ├── scrapers/        # Web scrapers
│   │   ├── home.js
│   │   ├── search.js
│   │   ├── anime.js
│   │   ├── streaming.js
│   │   ├── categories.js
│   │   └── schedule.js
│   └── utils/           # Utility functions
│       ├── scraper.js
│       └── cache.js
├── index.js             # Main application
├── package.json
└── .env.example
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3030` |
| `BASE_URL` | ToonStream base URL | `https://toonstream.love` |
| `CACHE_TTL` | Cache time-to-live (seconds) | `3600` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## API Documentation

Interactive API documentation is available at:

```
http://localhost:3030/docs
```

## Important Notice

> **⚠️ Disclaimer**: This API is for educational purposes only. Web scraping may violate the website's Terms of Service. Use responsibly and at your own risk.

## License

MIT

## Acknowledgments

- Inspired by [hianime-api](https://github.com/ryanwtf88/hianime-api)
- Built with [Bun.js](https://bun.sh) and [Hono](https://hono.dev)
- Scraping powered by [Cheerio](https://cheerio.js.org)

## Support

For issues and questions, please open an issue on GitHub.
