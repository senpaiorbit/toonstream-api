# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-03

### Changed
- **BREAKING**: Migrated from Cloudflare Workers to Vercel serverless functions
- Replaced Cloudflare-specific configurations with Vercel configuration
- Updated deployment process for Vercel platform
- Modified server entry point for Vercel compatibility
- Updated documentation to reflect Vercel deployment
- Added `@hono/node-server` for local development and Vercel deployment
- Updated OpenAPI specification to use Vercel URLs

### Added
- `vercel.json` configuration file
- `api/index.js` Vercel serverless entry point
- `src/server.js` for local development
- Vercel deployment button in README

### Removed
- Cloudflare Workers specific files (`wrangler.toml`, `src/worker.js`)
- `.wrangler` directory
- `wrangler` dependency from package.json
- Cloudflare-specific comments and references

### Fixed
- Cache implementation now works seamlessly with Vercel serverless functions
- Server startup logs moved to appropriate files

## [1.0.0] - 2024-11-29

### Added
- Initial release
- Home page data endpoint
- Search functionality with pagination
- Anime details with related content
- Episode streaming links
- Category browsing (genre, language, type)
- Weekly release schedule
- Optimized embed player with ad blocking
- Random movie/series endpoints
- Latest movies/series endpoints
- Interactive Swagger UI documentation
- Comprehensive API documentation

### Fixed
- Session/cookie handling for website bypass
- Episode and season extraction logic
- Schedule time parsing

### Security
- Removed sensitive account IDs from repository
- Added placeholder configuration values
