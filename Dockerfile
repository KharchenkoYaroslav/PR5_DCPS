# Build client
FROM node:18 as deps

WORKDIR /app
COPY package*.json ./

# Install dependencies in a separate layer
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --legacy-peer-deps

FROM node:18 as client-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build client

# Build server
FROM node:18 as server-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build server

# Final image with both services
FROM nginx:alpine

# Install required packages
RUN apk add --update nodejs npm gettext

# Copy client files
COPY --from=client-builder /app/dist/apps/client /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Setup server
WORKDIR /app
COPY --from=server-builder /app/dist/apps/server ./server
RUN cd server && npm install --omit=dev --legacy-peer-deps

# Start both services
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
