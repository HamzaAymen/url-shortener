FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
RUN bun install

COPY apps/api ./apps/api

WORKDIR /app/apps/api
CMD ["bun", "src/index.ts"]
