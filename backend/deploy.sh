#!/bin/bash
# Music MiniMax Backend Deployment Script

set -e

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BACKEND_DIR"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

start() {
    echo "Starting Music MiniMax Backend..."
    # Kill existing process on port 5000
    if lsof -ti:5000 > /dev/null 2>&1; then
        echo "Killing existing process on port 5000..."
        lsof -ti:5000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi

    # Start backend
    nohup python app.py > app.log 2>&1 &
    echo "Backend started with PID $!"
    sleep 2

    # Verify health
    if curl -s http://localhost:5000/api/health | grep -q "ok"; then
        echo "Backend is healthy!"
    else
        echo "Backend may have failed to start. Check app.log"
        cat app.log
    fi
}

stop() {
    echo "Stopping Music MiniMax Backend..."
    if lsof -ti:5000 > /dev/null 2>&1; then
        lsof -ti:5000 | xargs kill -9 2>/dev/null || true
        echo "Backend stopped"
    else
        echo "No backend running on port 5000"
    fi
}

restart() {
    stop
    sleep 1
    start
}

status() {
    if lsof -ti:5000 > /dev/null 2>&1; then
        echo "Backend is running on port 5000"
        curl -s http://localhost:5000/api/health
    else
        echo "Backend is not running"
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac