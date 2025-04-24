FROM node:lts-alpine as builder

WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY babel.config.json ./
COPY .swcrc ./
COPY libs ./libs
COPY apps/client ./apps/client

RUN npm ci
RUN npx nx build client

FROM nginx:alpine
COPY --from=builder /app/dist/apps/client /usr/share/nginx/html

RUN echo 'server { \
    listen 4200; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://server:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 4200
