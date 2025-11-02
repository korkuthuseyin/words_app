#!/bin/bash

# VPS Setup Script for Word Learning Game
# Run this script on your VPS after cloning the repository

set -e

echo "🚀 Setting up Word Learning Game on VPS..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo apt update
    sudo apt install docker-compose -y
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Build and start the container
echo "🐳 Building and starting Docker container..."
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Container status:"
docker ps | grep word-learning || echo "Container not running!"
echo ""
echo "🔗 The app is now running on http://localhost:8080"
echo ""
echo "📝 Next steps:"
echo "1. Configure Nginx reverse proxy (see DEPLOYMENT.md)"
echo "2. Set up DNS record for word.huseyinkorkut.com"
echo "3. Install SSL certificate with certbot"
echo ""
echo "Run 'docker logs word-learning-game' to view logs"
