#!/bin/sh

# Set default PORT if not provided
export PORT=${PORT:-8080}

echo "Configuring nginx for port ${PORT}..."

# Create nginx configuration with the correct port
sed "s/listen 8080/listen ${PORT}/" /etc/nginx/nginx.conf > /etc/nginx/conf.d/default.conf

# Verify nginx config
echo "Verifying nginx configuration..."
nginx -t || exit 1

# Start nginx in the background
echo "Starting nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait a moment for nginx to start
sleep 2

# Check if nginx is running
if ! kill -0 $NGINX_PID 2>/dev/null; then
    echo "Failed to start nginx"
    exit 1
fi

# Start the Node.js server
echo "Starting Node.js server..."
cd /app/server && node main.js &
NODE_PID=$!

# Wait a moment for the Node.js server to start
sleep 2

# Check if Node.js server is running
if ! kill -0 $NODE_PID 2>/dev/null; then
    echo "Failed to start Node.js server"
    exit 1
fi

# Function to check if a process is running
check_process() {
    if ! kill -0 $1 2>/dev/null; then
        echo "$2 process died"
        exit 1
    fi
}

# Monitor both processes
while true; do
    check_process $NGINX_PID "Nginx"
    check_process $NODE_PID "Node.js"
    sleep 10
done
