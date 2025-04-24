# Build client
FROM node:18 as client-builder

WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY libs ./libs
COPY apps/client ./apps/client

# Install dependencies with more memory
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install --legacy-peer-deps

RUN npx nx build client

# Build server
FROM node:18 as server-builder

WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY libs ./libs
COPY apps/server ./apps/server

# Install dependencies with more memory
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install --legacy-peer-deps

RUN npx nx build server

# Final image with both services
FROM nginx:alpine

# Copy client files
COPY --from=client-builder /app/dist/apps/client /usr/share/nginx/html

# Setup nginx config
RUN echo 'server { \
    listen $PORT; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://localhost:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Install Node.js
RUN apk add --update nodejs npm

# Setup server
WORKDIR /app
COPY --from=server-builder /app/dist/apps/server ./server
RUN cd server && npm install --omit=dev --legacy-peer-deps

# Start both services
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
