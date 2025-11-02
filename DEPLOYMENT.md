# Deployment Guide for word.huseyinkorkut.com

## Step 1: Prepare Your VPS

SSH into your VPS:
```bash
ssh your-user@your-vps-ip
```

Install Docker and Docker Compose (if not already installed):
```bash
# Update packages
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Transfer Files to VPS

From your local machine:
```bash
# Navigate to project directory
cd /Users/korkut/Desktop/projects/words_app

# Transfer files to VPS (replace with your actual VPS details)
scp -r index.html styles.css app.js words_with_examples.json Dockerfile docker-compose.yml nginx.conf your-user@your-vps-ip:~/word-learning-game/

# Or use rsync (better for updates)
rsync -avz --exclude='*.csv' --exclude='*.bak' --exclude='scripts' --exclude='.git' \
  /Users/korkut/Desktop/projects/words_app/ \
  your-user@your-vps-ip:~/word-learning-game/
```

## Step 3: Start Docker Container on VPS

SSH into your VPS and start the container:
```bash
ssh your-user@your-vps-ip

cd ~/word-learning-game

# Build and start the container
docker-compose up -d

# Check if it's running
docker ps
curl http://localhost:8080
```

## Step 4: Configure Nginx Reverse Proxy

Install Nginx on your VPS (if not already installed):
```bash
sudo apt install nginx -y
```

Create Nginx configuration for your subdomain:
```bash
sudo nano /etc/nginx/sites-available/word.huseyinkorkut.com
```

Add this configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name word.huseyinkorkut.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed in future)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/word.huseyinkorkut.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 5: Configure DNS

Go to your DNS provider (where huseyinkorkut.com is registered) and add:

**A Record:**
- Name: `word`
- Type: `A`
- Value: `YOUR_VPS_IP_ADDRESS`
- TTL: `3600` (or default)

Wait 5-10 minutes for DNS propagation, then test:
```bash
# Check DNS resolution
dig word.huseyinkorkut.com

# Test access
curl http://word.huseyinkorkut.com
```

## Step 6: Add SSL Certificate (HTTPS)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Get SSL certificate:
```bash
sudo certbot --nginx -d word.huseyinkorkut.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

Certbot will automatically:
- Get SSL certificate from Let's Encrypt
- Update Nginx configuration
- Set up auto-renewal

Test auto-renewal:
```bash
sudo certbot renew --dry-run
```

## Step 7: Verify Deployment

Open your browser and visit:
- http://word.huseyinkorkut.com (should redirect to HTTPS)
- https://word.huseyinkorkut.com (secured with SSL)

## Management Commands

### View container logs:
```bash
docker logs word-learning-game -f
```

### Restart container:
```bash
cd /opt/word-learning-game
docker-compose restart
```

### Stop container:
```bash
docker-compose down
```

### Update application:
```bash
# Transfer new files from local
rsync -avz --exclude='*.csv' --exclude='*.bak' --exclude='scripts' \
  /Users/korkut/Desktop/projects/words_app/ \
  your-user@your-vps-ip:~/word-learning-game/

# SSH to VPS and rebuild
ssh your-user@your-vps-ip
cd ~/word-learning-game
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### View Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Firewall Configuration

If you have UFW enabled:
```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'

# Or manually allow ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Troubleshooting

### Container not accessible:
```bash
# Check if container is running
docker ps

# Check container logs
docker logs word-learning-game

# Test internal access
curl http://localhost:8080
```

### DNS not resolving:
```bash
# Check DNS propagation
dig word.huseyinkorkut.com
nslookup word.huseyinkorkut.com

# Wait 5-30 minutes for full propagation
```

### Nginx errors:
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo journalctl -u nginx -f

# Restart Nginx
sudo systemctl restart nginx
```

### SSL certificate issues:
```bash
# Renew manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Quick Deployment Script

Save this as `deploy.sh` on your local machine:
```bash
#!/bin/bash

# Configuration
VPS_USER="your-user"
VPS_IP="your-vps-ip"
VPS_PATH="/opt/word-learning-game"

echo "🚀 Deploying Word Learning Game..."

# Transfer files
echo "📦 Transferring files..."
rsync -avz --exclude='*.csv' --exclude='*.bak' --exclude='scripts' --exclude='.git' \
  . "$VPS_USER@$VPS_IP:$VPS_PATH/"

# Deploy on VPS
echo "🐳 Restarting Docker container..."
ssh "$VPS_USER@$VPS_IP" << 'EOF'
cd /opt/word-learning-game
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker ps | grep word-learning
EOF

echo "✅ Deployment complete!"
echo "🌐 Visit: https://word.huseyinkorkut.com"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Summary

Your word learning game will be available at:
- **URL**: https://word.huseyinkorkut.com
- **Container**: Running on port 8080 internally
- **Nginx**: Reverse proxy on ports 80/443
- **SSL**: Automatic HTTPS with Let's Encrypt
- **Auto-renewal**: SSL certificate renews automatically

Happy learning! 📚✨
