# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.18

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY turbo.json ./

# Build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build application
RUN pnpm --filter web build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.18

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start application
CMD ["pnpm", "--filter", "web", "start"]