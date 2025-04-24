#!/bin/sh

# Start the server in the background
cd /app/server && node . &

# Use PORT from environment or default to 4200
export PORT=${PORT:-4200}

# Replace $PORT in nginx config with actual port
sed -i "s/\$PORT/$PORT/g" /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
