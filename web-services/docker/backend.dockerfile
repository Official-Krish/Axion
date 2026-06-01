FROM oven/bun:1 AS builder

WORKDIR /app

# Root files
COPY package.json bun.lock turbo.json ./

# Workspace manifests
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/utilities/package.json ./packages/utilities/package.json
COPY packages/types/package.json ./packages/types/package.json

# Prisma schema
COPY packages/db/prisma ./packages/db/prisma

# Install all dependencies
RUN bun install

# Copy source
COPY apps/backend ./apps/backend
COPY packages/db ./packages/db
COPY packages/utilities ./packages/utilities
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Generate Prisma client
RUN cd packages/db && bun run db:generate

# Build application
RUN cd apps/backend && bun run build

FROM oven/bun:1 AS prod-deps

WORKDIR /app

COPY package.json bun.lock turbo.json ./

COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/utilities/package.json ./packages/utilities/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/db/prisma ./packages/db/prisma

RUN bun install

FROM oven/bun:1-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Production dependencies only
COPY --from=prod-deps /app/node_modules ./node_modules

# App package.json
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

# Built app
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Runtime workspace packages
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/utilities ./packages/utilities
COPY --from=builder /app/packages/types ./packages/types

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["bun", "dist/index.js"]
