# Dockerfile for whykusanagi portfolio site
# Static site with Celeste widget API proxy (all in one container)

FROM node:18-slim

LABEL maintainer="whykusanagi"
LABEL description="whykusanagi portfolio - Virtual Streamer & Digital Artist"

WORKDIR /app

# Copy package files (if any)
COPY package.json ./

# Copy all site files
COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh
RUN chmod +x scripts/static-server.js
RUN chmod +x scripts/celeste-proxy-server.js

# Expose ports
# 8000: Static HTTP server
# 5000: Celeste API proxy
EXPOSE 8000 5000

# Health check - test static server
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run entrypoint script that starts both proxy and HTTP server
ENTRYPOINT ["./docker-entrypoint.sh"]
