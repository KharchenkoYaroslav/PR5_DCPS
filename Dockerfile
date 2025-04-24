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

# Copy client files
COPY --from=client-builder /app/dist/apps/client /usr/share/nginx/html

# Setup nginx config with optimized settings
RUN echo 'worker_processes 2;\n\
events {\n\
    worker_connections 1024;\n\
}\n\
http {\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    sendfile on;\n\
    keepalive_timeout 65;\n\
    server {\n\
        listen $PORT;\n\
        server_name localhost;\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        location / {\n\
            try_files $uri $uri/ /index.html;\n\
        }\n\
        location /api/ {\n\
            proxy_pass http://localhost:3000;\n\
            proxy_http_version 1.1;\n\
            proxy_set_header Upgrade $http_upgrade;\n\
            proxy_set_header Connection "upgrade";\n\
            proxy_set_header Host $host;\n\
        }\n\
    }\n\
}' > /etc/nginx/nginx.conf

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
