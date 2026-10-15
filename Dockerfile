# Multi-stage Dockerfile for FacturaSheet
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package specifications and install dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# Copy application source code
COPY . .

# Build application for production
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install lightweight static web server
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Port 3000 as standard for container deployment
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Serve the SPA on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
