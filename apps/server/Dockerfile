# Build stage
FROM node:18-alpine as builder

# Install necessary build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json .npmrc ./

# Install dependencies with increased memory limit
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build server
RUN npx nx build server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built server files and package files
COPY --from=builder /app/dist/apps/server ./
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "main.js"]
