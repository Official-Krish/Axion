FROM oven/bun:1 AS builder

WORKDIR /app

# Root files
COPY package.json bun.lock turbo.json ./

# Workspace manifests
COPY apps/depin-ws-relayer/package.json ./apps/depin-ws-relayer/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/utilities/package.json ./packages/utilities/package.json

# Prisma schema
COPY packages/db/prisma ./packages/db/prisma

# Install all dependencies
RUN bun install

# Copy source
COPY apps/depin-ws-relayer ./apps/depin-ws-relayer
COPY packages/db ./packages/db
COPY packages/utilities ./packages/utilities
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Generate Prisma client
RUN cd packages/db && bun run db:generate

# Build application
RUN cd apps/depin-ws-relayer && bun run build

FROM oven/bun:1 AS prod-deps

WORKDIR /app

COPY package.json bun.lock turbo.json ./

COPY apps/depin-ws-relayer/package.json ./apps/depin-ws-relayer/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/utilities/package.json ./packages/utilities/package.json
COPY packages/db/prisma ./packages/db/prisma

RUN bun install

FROM oven/bun:1-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Production dependencies only
COPY --from=prod-deps /app/node_modules ./node_modules

# App package.json (optional but useful)
COPY --from=builder /app/apps/depin-ws-relayer/package.json ./apps/depin-ws-relayer/package.json

# Built app
COPY --from=builder /app/apps/depin-ws-relayer/dist ./apps/depin-ws-relayer/dist

# Runtime workspace packages
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/utilities ./packages/utilities

WORKDIR /app/apps/depin-ws-relayer

EXPOSE 8080

CMD ["bun", "dist/index.js"]