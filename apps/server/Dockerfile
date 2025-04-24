# Build stage
FROM node:18 as builder

WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build server
RUN npx nx build server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built server files
COPY --from=builder /app/dist/apps/server ./
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "main.js"]
