#!/bin/bash
# Cleanup script to remove Cloudflare and temporary files

echo "🧹 Cleaning up Cloudflare and temporary files..."

# Remove Cloudflare-specific files
echo "Removing Cloudflare files..."
rm -f wrangler.toml
rm -f src/worker.js
rm -rf .wrangler

# Remove temporary files
echo "Removing temporary documentation..."
rm -f MIGRATION_SUMMARY.md

# Remove temp files from /tmp
echo "Removing temporary files from /tmp..."
rm -f /tmp/old_scraper.js
rm -f /tmp/old_scraper_full.js
rm -f /tmp/servers_*.js
rm -f /tmp/server.log

# Git operations
echo "Committing changes to git..."
git add -A
git commit -m "Remove Cloudflare-specific and temporary files"
git push origin vercel

echo "✅ Cleanup complete!"
echo ""
echo "Files removed:"
echo "  - wrangler.toml"
echo "  - src/worker.js"
echo "  - .wrangler/"
echo "  - MIGRATION_SUMMARY.md"
echo "  - /tmp/*.js temp files"
echo ""
echo "✨ Your project is now ready for Vercel deployment!"
