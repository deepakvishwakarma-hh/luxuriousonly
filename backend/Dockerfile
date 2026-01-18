# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /server

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./
COPY package-lock.json* ./

# Install dependencies (use npm ci if lock file exists and is valid, otherwise npm install)
RUN if [ -f package-lock.json ]; then \
        npm ci --only=production --legacy-peer-deps || npm install --only=production --legacy-peer-deps; \
    else \
        npm install --only=production --legacy-peer-deps; \
    fi && \
    npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /server

# Copy package files
COPY package*.json ./
COPY package-lock.json* ./

# Install all dependencies (including devDependencies for build)
# Use npm ci if lock file exists and is valid, otherwise npm install
RUN if [ -f package-lock.json ]; then \
        npm ci --legacy-peer-deps || npm install --legacy-peer-deps; \
    else \
        npm install --legacy-peer-deps; \
    fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /server

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy production dependencies (but we need devDependencies for ts-node and TypeScript support)
COPY --from=builder --chown=medusa:nodejs /server/node_modules ./node_modules

# Copy all application files from builder (excluding node_modules which we already copied)
# This ensures all config files and source files are present
COPY --from=builder --chown=medusa:nodejs /server/src ./src
COPY --from=builder --chown=medusa:nodejs /server/public ./public
COPY --from=builder --chown=medusa:nodejs /server/package*.json ./
COPY --from=builder --chown=medusa:nodejs /server/medusa-config.ts ./
COPY --from=builder --chown=medusa:nodejs /server/tsconfig.json ./
COPY --from=builder --chown=medusa:nodejs /server/instrumentation.ts ./

# Create directories for uploads
RUN mkdir -p /server/uploads /server/static && \
    chown -R medusa:nodejs /server/uploads /server/static

USER medusa

EXPOSE 9000

ENV NODE_ENV=production
ENV PORT=9000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:9000/health || exit 1

CMD ["npm", "run", "start"]
