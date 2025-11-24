#!/bin/bash
# Docker entrypoint script for whykusanagi.xyz
# Starts the Celeste API proxy and static file server (both in Node.js)

set -e

echo "[Docker] Starting whykusanagi.xyz site"

# Check if Celeste environment variables are provided
if [ -z "$CELESTE_AGENT_KEY" ] || [ -z "$CELESTE_AGENT_ID" ] || [ -z "$CELESTE_AGENT_BASE_URL" ]; then
    echo "[Celeste] ⚠️  Warning: One or more required environment variables are missing!"
    echo "[Celeste] Required: CELESTE_AGENT_KEY, CELESTE_AGENT_ID, CELESTE_AGENT_BASE_URL"
    echo "[Celeste] The Celeste widget API proxy will not start, but static site will serve."
    echo "[Celeste] To enable the widget, provide these environment variables."

    # Start only HTTP server (no widget API)
    echo "[Docker] Starting static file server on http://0.0.0.0:8000"
    exec node scripts/static-server.js
else
    echo "[Celeste] ✅ Configuration validated"
    echo "[Celeste]    Agent ID: ${CELESTE_AGENT_ID:0:8}..."
    echo "[Celeste]    Base URL: ${CELESTE_AGENT_BASE_URL}"

    # Start the API proxy in the background
    echo "[Docker] Starting Celeste API proxy on http://0.0.0.0:5000"
    PROXY_PORT=5000 STATIC_PORT=8000 node scripts/celeste-proxy-server.js &
    PROXY_PID=$!

    # Give proxy time to start
    sleep 2

    # Check if proxy started successfully
    if ! kill -0 $PROXY_PID 2>/dev/null; then
        echo "[Docker] ❌ Failed to start Celeste API proxy"
        exit 1
    fi

    echo "[Docker] ✅ Celeste API proxy started (PID: $PROXY_PID)"

    # Start the static file server in foreground
    echo "[Docker] Starting static file server on http://0.0.0.0:8000"

    # Trap signals to clean up proxy when container stops
    trap "kill $PROXY_PID 2>/dev/null || true" EXIT INT TERM

    # Serve static files
    exec node scripts/static-server.js
fi
