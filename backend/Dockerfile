# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy production dependencies
COPY --from=deps --chown=medusa:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=medusa:nodejs /app/dist ./dist
COPY --from=builder --chown=medusa:nodejs /app/src ./src
COPY --from=builder --chown=medusa:nodejs /app/public ./public
COPY --from=builder --chown=medusa:nodejs /app/package*.json ./
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.ts ./
COPY --from=builder --chown=medusa:nodejs /app/tsconfig.json ./
COPY --from=builder --chown=medusa:nodejs /app/instrumentation.ts ./instrumentation.ts

# Create directories for uploads
RUN mkdir -p /app/uploads /app/static && \
    chown -R medusa:nodejs /app/uploads /app/static

USER medusa

EXPOSE 9000

ENV NODE_ENV=production
ENV PORT=9000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:9000/health || exit 1

CMD ["npm", "run", "start"]
