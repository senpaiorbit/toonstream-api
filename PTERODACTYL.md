# ToonStream API - Pterodactyl Deployment

Complete guide for deploying ToonStream API on Pterodactyl panel using Bun.js

## Quick Setup

### 1. Import Egg

1. Download `egg.json` from this repository
2. Go to your Pterodactyl Admin Panel
3. Navigate to **Nests** → **Import Egg**
4. Upload `egg.json`
5. Assign to a nest (create "Bun Applications" nest if needed)

### 2. Create Server

1. Go to **Servers** → **Create New**
2. Select the **ToonStream API (Bun)** egg
3. Configure:
   - **Server Name**: ToonStream API
   - **Memory**: 512MB minimum (1GB recommended)
   - **Disk**: 1GB minimum
   - **CPU**: 100% minimum
   - **Port**: Auto-assign or specify (default: 3030)

4. Set variables:
   - **Server Port**: 3030 (or your preferred port)
   - **Git Repository**: `https://github.com/ryanwtf88/toonstream-api.git`
   - **Auto Update**: 0 (set to 1 for auto-updates on restart)

### 3. Start Server

1. Click **Start** on your server
2. Wait for installation to complete
3. Server will start automatically

## Access Your API

Your API will be available at:
```
http://your-server-ip:3030
```

### Test Endpoints

```bash
# Home page
curl http://your-server-ip:3030/api/home

# Search
curl "http://your-server-ip:3030/api/search?keyword=naruto"

# Anime details
curl http://your-server-ip:3030/api/anime/bleach-dub

# Documentation
http://your-server-ip:3030/docs
```

## Configuration

### Port Configuration

Edit `config.js` in the file manager:

```javascript
export default {
  port: 3030, // Change this to your allocated port
  baseUrl: 'https://toonstream.love',
  cacheTTL: 3600,
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100
  }
};
```

### Environment Variables

The egg supports these variables:

| Variable | Default | Description |
|----------|---------|-------------|
| SERVER_PORT | 3030 | API listening port |
| GIT_ADDRESS | github.com/ryanwtf88/toonstream-api | Repository URL |
| AUTO_UPDATE | 0 | Auto-pull on restart (0=off, 1=on) |

## Manual Installation

If you prefer manual setup:

1. **Create server** with Bun egg
2. **Upload files** via SFTP or file manager
3. **Install dependencies**:
   ```bash
   bun install
   ```
4. **Start server**:
   ```bash
   bun run start
   ```

## Updating

### Automatic Updates

Set `AUTO_UPDATE=1` in server variables, then restart.

### Manual Update

```bash
cd /home/container
git pull origin master
bun install
# Restart server from panel
```

## Resource Requirements

### Minimum
- **RAM**: 512MB
- **CPU**: 100%
- **Disk**: 1GB
- **Network**: 1Mbps

### Recommended
- **RAM**: 1GB
- **CPU**: 200%
- **Disk**: 2GB
- **Network**: 10Mbps

## Troubleshooting

### Server Won't Start

1. Check port allocation
2. Verify `config.js` port matches allocated port
3. Check console for errors
4. Ensure Bun is installed: `bun --version`

### 403 Errors

The API uses axios with cookie jar to bypass Cloudflare. If you still get 403 errors:

1. Your server IP might be blocked
2. Try using a VPN or proxy
3. Check if toonstream.love is accessible from your server:
   ```bash
   curl -I https://toonstream.love
   ```

### High Memory Usage

1. Reduce cache TTL in `config.js`
2. Increase allocated RAM
3. Restart server periodically

### Port Already in Use

1. Stop any conflicting services
2. Change port in panel variables
3. Update `config.js` to match

## Performance Optimization

### Caching

Adjust cache TTL in `config.js`:

```javascript
cacheTTL: 3600, // 1 hour (reduce for less memory usage)
```

### Rate Limiting

Adjust rate limits:

```javascript
rateLimit: {
  windowMs: 60000,    // 1 minute window
  maxRequests: 100    // Max requests per window
}
```

## Reverse Proxy (Optional)

### Nginx

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3030
```

## Monitoring

### Check Status

```bash
# CPU usage
top

# Memory usage
free -h

# Disk usage
df -h

# Network
netstat -tulpn | grep 3030
```

### Logs

View logs in Pterodactyl console or:

```bash
tail -f /home/container/logs/api.log
```

## Security

### Firewall

Only expose necessary ports:

```bash
# Allow API port
ufw allow 3030/tcp

# Enable firewall
ufw enable
```

### Rate Limiting

The API includes built-in rate limiting (100 req/min). Adjust in `config.js` if needed.

## Support

- **Issues**: https://github.com/ryanwtf88/toonstream-api/issues
- **Docs**: Check `/docs` endpoint on your API

## License

MIT License - See repository for details
