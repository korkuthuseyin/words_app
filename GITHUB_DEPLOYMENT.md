# Quick GitHub & VPS Deployment Guide

## Step 1: Push to GitHub

### Create a new repository on GitHub:
1. Go to https://github.com/new
2. Repository name: `word-learning-game` (or any name you prefer)
3. Keep it **Public** or **Private** (your choice)
4. **Don't** initialize with README (we already have one)
5. Click "Create repository"

### Push your local code:
```bash
cd /Users/korkut/Desktop/projects/words_app

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/word-learning-game.git

# Push to GitHub
git push -u origin main
```

If you prefer SSH (recommended):
```bash
git remote add origin git@github.com:YOUR_USERNAME/word-learning-game.git
git push -u origin main
```

## Step 2: Deploy on VPS

### SSH into your VPS:
```bash
ssh your-user@your-vps-ip
```

### Clone the repository:
```bash
# Navigate to where you want to install
cd /opt

# Clone your repository (replace YOUR_USERNAME)
sudo git clone https://github.com/YOUR_USERNAME/word-learning-game.git
cd word-learning-game

# Give your user ownership
sudo chown -R $USER:$USER /opt/word-learning-game
```

### Run the automated setup:
```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
- ✅ Install Docker (if needed)
- ✅ Install Docker Compose (if needed)
- ✅ Build the Docker image
- ✅ Start the container on port 8080

### Verify it's running:
```bash
docker ps
curl http://localhost:8080
```

## Step 3: Configure Nginx & Domain

### Install Nginx:
```bash
sudo apt update
sudo apt install nginx -y
```

### Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/word.huseyinkorkut.com
```

Paste this configuration:
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
    }
}
```

### Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/word.huseyinkorkut.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Configure DNS:
Add an A record in your DNS provider:
- **Name**: `word`
- **Type**: `A`
- **Value**: `YOUR_VPS_IP`

Wait 5-10 minutes for DNS propagation.

### Add SSL Certificate:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d word.huseyinkorkut.com
```

## Step 4: Test Your Site

Visit: **https://word.huseyinkorkut.com** 🎉

## Future Updates

When you make changes to your app:

### On your local machine:
```bash
cd /Users/korkut/Desktop/projects/words_app

# Make your changes, then:
git add .
git commit -m "Description of changes"
git push
```

### On your VPS:
```bash
cd /opt/word-learning-game

# Pull latest changes
git pull

# Rebuild and restart container
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
docker ps
```

## Useful Commands

### View logs:
```bash
docker logs word-learning-game -f
```

### Restart container:
```bash
docker-compose restart
```

### Stop container:
```bash
docker-compose down
```

### Check Nginx status:
```bash
sudo systemctl status nginx
```

### Renew SSL certificate:
```bash
sudo certbot renew
```

## Troubleshooting

### Container not starting:
```bash
docker logs word-learning-game
docker-compose down
docker-compose up
```

### Port already in use:
```bash
sudo lsof -i :8080
# Kill the process or change port in docker-compose.yml
```

### Nginx errors:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Can't access site:
```bash
# Check firewall
sudo ufw status
sudo ufw allow 'Nginx Full'

# Check DNS
dig word.huseyinkorkut.com
```

## Summary

**Local → GitHub → VPS workflow:**

1. 💻 Local: Make changes → `git commit` → `git push`
2. ☁️ GitHub: Stores your code
3. 🖥️ VPS: `git pull` → `docker-compose up -d` → Live!

Your app will be live at: **https://word.huseyinkorkut.com** 🚀
