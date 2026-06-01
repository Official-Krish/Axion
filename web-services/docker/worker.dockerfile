FROM oven/bun:1 AS builder

WORKDIR /app

# Root files
COPY package.json bun.lock turbo.json ./

# Workspace manifests
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/utilities/package.json ./packages/utilities/package.json

# Prisma schema
COPY packages/db/prisma ./packages/db/prisma

# Install all dependencies
RUN bun install

# Copy source
COPY apps/worker ./apps/worker
COPY packages/db ./packages/db
COPY packages/utilities ./packages/utilities
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Generate Prisma client
RUN cd packages/db && bun run db:generate

# Build application
RUN cd apps/worker && bun run build

FROM oven/bun:1 AS prod-deps

WORKDIR /app

COPY package.json bun.lock turbo.json ./

COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/utilities/package.json ./packages/utilities/package.json
COPY packages/db/prisma ./packages/db/prisma

RUN bun install

FROM oven/bun:1-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Production dependencies only
COPY --from=prod-deps /app/node_modules ./node_modules

# App source
COPY --from=builder /app/apps/worker ./apps/worker

# Runtime workspace packages
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/utilities ./packages/utilities

WORKDIR /app/apps/worker

CMD ["bun", "index.ts"]
