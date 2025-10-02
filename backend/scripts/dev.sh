#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV=${1:-development}
COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env.$ENV"

echo "Starting Footprint Logger App in ${ENV^} Mode"
echo "==============================================="

if [ ! -f "$ENV_FILE" ]; then
    echo "   Error: $ENV_FILE file not found in project root!"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "   Error: Docker is not running!"
    exit 1
fi

if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

if [ "${2:-}" = "stop" ]; then
    echo "Stopping $ENV containers..."
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" down
    exit 0
fi

echo "  Building and starting containers..."
$DOCKER_COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up --build -d

echo "  Waiting for MongoDB to be ready..."
for i in {1..10}; do
    if $DOCKER_COMPOSE -f "$COMPOSE_FILE" ps | grep -q "healthy"; then
        echo " MongoDB is ready!"
        break
    fi
    echo "   - still waiting... ($i/10)"
    sleep 3
done

echo ""
echo "   $ENV environment started!"
echo "   Application: http://localhost:5000"
echo "   Logs: docker logs footprint-logger-app-dev"