# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies required for node-gyp and native modules if any
RUN apk add --no-cache python3 make g++

# Copy package configurations and install dependencies
COPY package*.json ./
COPY packages/database/package.json ./packages/database/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the server package
RUN npm run build --workspace=@bizlens/server

# Production Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S bizlens && adduser -S bizlens -G bizlens

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
COPY packages/database/package.json ./packages/database/
COPY server/package.json ./server/
RUN npm ci --omit=dev

# Copy generated Prisma files
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built server assets
COPY --from=builder /app/server/dist ./server/dist

# Ensure the non-root user owns the app directory
RUN chown -R bizlens:bizlens /app

# Switch to non-root user
USER bizlens

EXPOSE 4000

# Start the Node server
CMD ["node", "server/dist/index.js"]
