FROM oven/bun:1.3-alpine

# Prisma needs OpenSSL on Alpine/musl
RUN apk add --no-cache openssl libstdc++

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json bun.lock* ./
RUN bun install

# Copy source
COPY . .

# Generate Prisma client into node_modules
RUN bunx prisma generate --schema=shared/prisma/schema.prisma

# Default port range is provided per-service via compose command/env
EXPOSE 3001 3002 3003 3004 8080

# Overridden by docker-compose per service
CMD ["bun", "run", "gateway/src/index.ts"]
