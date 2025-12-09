# 🎬 ToonStream API

A comprehensive RESTful API for scraping anime content from toonstream.one - Optimized for **Vercel** serverless deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ryanwtf88/toonstream-api)

## ✨ Features

- 🏠 **Homepage Data** - Latest series, movies, and schedule
- 🔍 **Search** - Find anime with pagination and suggestions
- 📺 **Anime Details** - Complete information with related content
- 🎥 **Episode Streaming** - Multiple server links with quality options
- 📁 **Categories** - Browse by genre, language, and type
- 📅 **Schedule** - Weekly release calendar
- 🎲 **Random** - Get random movies or series
- 🆕 **Latest** - Latest movies and series
- 🎮 **Embed Player** - Optimized player with ad blocking
- 📖 **Swagger UI** - Interactive API documentation

## 🚀 Quick Start

### Deploy to Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Your API will be live in seconds!

### Local Development

```bash
# Clone the repository
git clone https://github.com/ryanwtf88/toonstream-api.git
cd toonstream-api

# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at `http://localhost:3030`

## 📚 API Endpoints

### Home
```
GET /api/home
```
Returns latest series, movies, and schedule from homepage.

### Search
```
GET /api/search?keyword={query}&page={page}
GET /api/search/suggestions?keyword={query}
```
Search anime with pagination and get search suggestions.

### Anime Details
```
GET /api/anime/{id}
```
Get complete anime information including episodes and related content.

### Episode Streaming
```
GET /api/episode/{id}
GET /api/episode/{id}/servers/{serverId}
```
Get streaming links from all servers or a specific server.

### Categories
```
GET /api/categories
GET /api/category/{name}?page={page}
GET /api/category/language/{lang}?page={page}
GET /api/category/type/movies?page={page}
GET /api/category/type/series?page={page}
```
Browse anime by category, language, or type.

### Schedule
```
GET /api/schedule
GET /api/schedule/{day}
```
Get weekly schedule or schedule for a specific day.

### Latest & Random
```
GET /api/category/latest/movies
GET /api/category/latest/series
GET /api/category/random/movie
GET /api/category/random/series
```
Get latest or random anime content.

### Embed Player
```
GET /embed/{id}
```
Optimized player embed with ad blocking.

### Batch Operations
```
POST /api/anime/batch-availability
Body: { "ids": ["anime-id-1", "anime-id-2"] }
```
Check availability of multiple anime at once.

## 📖 Documentation

- **Swagger UI**: Visit `/` on your deployed API
- **Endpoint List**: Visit `/docs` for a JSON list of all endpoints
- **OpenAPI Spec**: Available at `/api/openapi.json`

## 🛠️ Configuration

Environment variables (optional):

```env
PORT=3030
NODE_ENV=production
```

Edit `config.js` to customize:
- Cache TTL (default: 3600 seconds)
- Request timeout
- User agent
- Base URL

## 📦 Project Structure

```
toonstream-api/
├── api/
│   └── index.js          # Vercel serverless entry point
├── src/
│   ├── routes/           # API route handlers
│   │   ├── anime.js
│   │   ├── categories.js
│   │   ├── embed.js
│   │   ├── episodes.js
│   │   ├── home.js
│   │   ├── schedule.js
│   │   └── search.js
│   ├── scrapers/         # Web scraping logic
│   │   ├── anime.js
│   │   ├── categories.js
│   │   ├── home.js
│   │   ├── schedule.js
│   │   ├── search.js
│   │   └── streaming.js
│   ├── utils/            # Utility functions
│   │   ├── cache.js      # In-memory caching
│   │   └── scraper.js    # Scraping utilities
│   ├── app.js            # Hono app setup
│   └── server.js         # Local development server
├── config.js             # Configuration
├── vercel.json           # Vercel deployment config
└── package.json
```

## 🔧 Technologies

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Scraping**: [Cheerio](https://cheerio.js.org/) - jQuery-like HTML parsing
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **Deployment**: [Vercel](https://vercel.com/) - Serverless platform
- **Documentation**: [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive API docs

## 📝 Example Usage

### JavaScript/Node.js
```javascript
// Search for anime
const response = await fetch('https://your-api.vercel.app/api/search?keyword=naruto');
const data = await response.json();
console.log(data);

// Get anime details
const anime = await fetch('https://your-api.vercel.app/api/anime/naruto-shippuden');
const details = await anime.json();
console.log(details);

// Get episode streaming links
const episode = await fetch('https://your-api.vercel.app/api/episode/naruto-shippuden-episode-1');
const streams = await episode.json();
console.log(streams);
```

### Python
```python
import requests

# Search for anime
response = requests.get('https://your-api.vercel.app/api/search?keyword=naruto')
data = response.json()
print(data)

# Get anime details
anime = requests.get('https://your-api.vercel.app/api/anime/naruto-shippuden')
details = anime.json()
print(details)
```

### cURL
```bash
# Search for anime
curl "https://your-api.vercel.app/api/search?keyword=naruto"

# Get anime details
curl "https://your-api.vercel.app/api/anime/naruto-shippuden"

# Get episode streaming links
curl "https://your-api.vercel.app/api/episode/naruto-shippuden-episode-1"
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This API is for educational purposes only. The scraping of content should comply with the terms of service of the target website. Use responsibly and respect copyright laws.

## 🙏 Acknowledgments

- Data source: [toonstream.one](https://toonstream.one)
- Built with [Hono](https://hono.dev/)
- Deployed on [Vercel](https://vercel.com/)

## 📧 Contact

- Author: RY4N
- GitHub: [@ryanwtf88](https://github.com/ryanwtf88)

---

**Note**: This API scrapes content from toonstream.one. Make sure to respect their terms of service and rate limits. The API includes caching to minimize requests to the source website.
