# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.18

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY turbo.json ./

# Generate Prisma Client
RUN cd apps/api && npx prisma generate

# Build application
RUN pnpm --filter api build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.18

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma Client in production
RUN cd apps/api && npx prisma generate

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start application
CMD ["node", "apps/api/dist/main.js"]