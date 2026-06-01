FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps/frontend/package.json apps/frontend/package.json

RUN bun install

COPY apps/frontend ./apps/frontend

ARG VITE_BACKEND_URL=/api/v1
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

WORKDIR /app/apps/frontend

RUN bun run build

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["sh", "-c", "set -a; if [ -f /etc/axion/frontend.env ]; then . /etc/axion/frontend.env; fi; set +a; cat > /usr/share/nginx/html/env.js <<EOF\nwindow.__AXION_ENV__ = {\n  VITE_BACKEND_URL: \"${VITE_BACKEND_URL:-}\",\n  VITE_ADMIN_KEY: \"${VITE_ADMIN_KEY:-}\",\n  VITE_WS_RELAYER_URL: \"${VITE_WS_RELAYER_URL:-}\",\n  VITE_SOLANA_RPC_URL: \"${VITE_SOLANA_RPC_URL:-}\",\n};\nEOF\nexec nginx -g 'daemon off;'"]
