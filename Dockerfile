# --- Stage 1: Build Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Use clean install with reduced network overhead and higher timeout
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.12-slim

# Install Node.js and build tools
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Backend Dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend Code
COPY backend/ ./backend/

# Copy Frontend Build
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/next.config.ts ./frontend/next.config.ts

# Entrypoint Script
COPY <<EOF /app/start.sh
#!/bin/sh
# Start backend in background
cd /app && python -m backend.main &
# Start frontend
cd /app/frontend && npm start
EOF

RUN chmod +x /app/start.sh

EXPOSE 8000 3000

CMD ["/app/start.sh"]
