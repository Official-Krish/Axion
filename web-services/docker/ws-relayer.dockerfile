FROM oven/bun:1 AS builder

WORKDIR /app

# Root files
COPY package.json bun.lock turbo.json ./

# Workspace manifests
COPY apps/ws-relayer/package.json ./apps/ws-relayer/package.json

# Install all dependencies
RUN bun install

# Copy source
COPY apps/ws-relayer ./apps/ws-relayer

# Build application
RUN cd apps/ws-relayer && bun run build

FROM oven/bun:1 AS prod-deps

WORKDIR /app

COPY package.json bun.lock turbo.json ./

COPY apps/ws-relayer/package.json ./apps/ws-relayer/package.json

RUN bun install

FROM oven/bun:1-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Production dependencies only
COPY --from=prod-deps /app/node_modules ./node_modules

# App package.json
COPY --from=builder /app/apps/ws-relayer/package.json ./apps/ws-relayer/package.json

# Built app
COPY --from=builder /app/apps/ws-relayer/dist ./apps/ws-relayer/dist

WORKDIR /app/apps/ws-relayer

EXPOSE 9093

CMD ["bun", "dist/index.js"]