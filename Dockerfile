# ==============================================================================
# Multi-Stage Production Dockerfile for Portfolio-web
# Stage 1: Build Vite / React Frontend Bundle (node:20-alpine)
# Stage 2: Serve API & Static SPA via FastAPI (python:3.11-slim) on Port 8001
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies utilizing Docker cache
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source and build production bundle
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Backend & Static SPA Runtime
# ------------------------------------------------------------------------------
FROM python:3.11-slim AS production

# Environment configuration
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8001 \
    STATIC_DIR=/app/frontend/dist \
    DATA_DIR=/app/data

WORKDIR /app

# Install system dependencies (curl for container healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY backend/ /app/

# Copy compiled frontend distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure persistence and media upload directories exist
RUN mkdir -p /app/data /app/uploads /app/backups

# Expose production port
EXPOSE 8001

# Start Uvicorn serving FastAPI + Static SPA bundle
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
