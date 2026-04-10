# Optimized Unified FinGuard AI Dockerfile
# Optimized for Railway / Render resource limits

# --- Stage 1: Build Frontend ---
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- Stage 2: Build API Gateway ---
FROM node:20-slim AS gateway-build
WORKDIR /app/api-gateway
COPY api-gateway/package*.json ./
RUN npm install
COPY api-gateway/ .
RUN npm run build

# --- Stage 3: Final Production Image ---
FROM node:20-slim

WORKDIR /app

# Install Python (Minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Setup Python environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies (Using wheels, no build-essential needed)
COPY ai-engine/requirements.txt ./ai-engine/
RUN pip install --no-cache-dir -r ./ai-engine/requirements.txt
RUN python3 -m textblob.download_corpora

# Copy AI Engine code
COPY ai-engine/ ./ai-engine/

# Copy API Gateway built code
COPY --from=gateway-build /app/api-gateway/dist ./api-gateway/dist
COPY --from=gateway-build /app/api-gateway/package*.json ./api-gateway/

# Install Gateway production dependencies
WORKDIR /app/api-gateway
RUN npm install --omit=dev

# Copy Frontend build into Gateway's public directory
COPY --from=frontend-build /app/frontend/dist ./public

# Setup unified start script
WORKDIR /app
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 4000
CMD ["./start.sh"]
