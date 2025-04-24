#!/bin/sh

# Replace environment variables in nginx.conf
envsubst '${PORT}' < /etc/nginx/nginx.conf > /etc/nginx/conf.d/default.conf

# Start nginx in the background
nginx -g 'daemon off;' &

# Start the Node.js server
cd /app/server && node main.js
