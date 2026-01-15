# Docker Setup for Agora MerchantHub

This project includes Docker and Docker Compose configurations for both development and production environments.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Development Mode

Run the application in development mode with hot-reload:

```bash
docker-compose up frontend-dev
```

The application will be available at `http://localhost:3000`

### Production Mode

Build and run the production-optimized version:

```bash
docker-compose --profile production up frontend-prod
```

The application will be available at `http://localhost:8080`

## Available Services

### `frontend-dev`
- **Purpose:** Development environment with Vite dev server
- **Port:** 3000
- **Features:**
  - Hot module replacement (HMR)
  - Source maps for debugging
  - Volume mounting for live code changes
  - Fast refresh

### `frontend-prod`
- **Purpose:** Production environment with nginx
- **Port:** 8080
- **Features:**
  - Optimized build (minified, tree-shaken)
  - Gzip compression
  - Static asset caching
  - SPA routing support
  - Security headers

## Common Commands

```bash
# Start development environment
docker-compose up frontend-dev

# Start in detached mode
docker-compose up -d frontend-dev

# Stop containers
docker-compose down

# Rebuild containers (after dependency changes)
docker-compose up --build frontend-dev

# View logs
docker-compose logs -f frontend-dev

# Start production environment
docker-compose --profile production up frontend-prod

# Clean up everything (containers, networks, volumes)
docker-compose down -v

# Remove unused images
docker image prune -a
```

## Building Individual Images

### Development Image
```bash
docker build --target development -t agora-frontend:dev .
docker run -p 3000:3000 -v $(pwd)/src:/app/src agora-frontend:dev
```

### Production Image
```bash
docker build --target production -t agora-frontend:prod .
docker run -p 8080:80 agora-frontend:prod
```

## Environment Variables

No environment variables are currently required. For future API integration, create a `.env` file:

```bash
# .env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

Then update `docker-compose.yml` to pass these to the container:

```yaml
environment:
  - VITE_API_URL=${VITE_API_URL}
  - VITE_API_TIMEOUT=${VITE_API_TIMEOUT}
```

## Volume Mounts (Development)

The development service mounts these directories for live updates:
- `./src` → Application source code
- `./public` → Static assets
- `./index.html` → Entry HTML file
- `./vite.config.js` → Vite configuration

Changes to these files will trigger hot reload without container restart.

## Troubleshooting

### Port already in use
```bash
# Check what's using the port
lsof -i :3000

# Use different port in docker-compose.yml
ports:
  - "3001:3000"
```

### Container won't start
```bash
# Check logs
docker-compose logs frontend-dev

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache frontend-dev
docker-compose up frontend-dev
```

### Dependencies not updating
```bash
# Rebuild after package.json changes
docker-compose down
docker-compose up --build frontend-dev
```

### Permission errors (Linux)
```bash
# Run with your user ID
docker-compose run --user $(id -u):$(id -g) frontend-dev
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build --target production -t agora-frontend:${{ github.sha }} .
      - name: Test container
        run: docker run -d -p 8080:80 agora-frontend:${{ github.sha }}
```

## Production Deployment

For production deployment, consider:

1. **Multi-stage build optimization:** Already implemented
2. **Health checks:** Available at `/health` endpoint
3. **Resource limits:** Add to docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```
4. **Secrets management:** Use Docker secrets or environment variables
5. **Reverse proxy:** Place nginx behind a reverse proxy (Traefik, Caddy, etc.)

## Network Configuration

Both services use the `agora-network` bridge network. This allows:
- Service discovery by name
- Easy integration with backend services
- Network isolation

To connect a backend service:
```yaml
services:
  backend:
    # ... backend config
    networks:
      - agora-network
```

## Health Checks

The production nginx image includes a health check endpoint:

```bash
# Check container health
curl http://localhost:8080/health
```

Add to docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 3s
  retries: 3
```
