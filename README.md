# Word Learning Game 📚

A simple, effective web application for learning English vocabulary through progressive levels (A1-C2). Built with vanilla JavaScript, optimized for Docker deployment.

## Features

### 🎓 Learn Mode
- Progress through CEFR levels (A1 → A2 → B1 → B2 → C1 → C2)
- Only shows unknown words and words marked for review
- Automatic level advancement when completing a level
- Each word displays: word, level, meaning, and example sentence

### 💪 Practice Mode
- Select any level to practice
- Random word order for better learning
- Review any level at any time
- Same marking system as Learn Mode

### 📊 Smart Progress Tracking
- All progress stored in browser localStorage
- Tracks known words and words needing review
- Per-level progress statistics
- Cross-session persistence (per browser)
- Fresh start in different browsers (as requested)

### 🎯 Two-Button System
- **I Know**: Mark word as known, won't show again in Learn Mode
- **It's New**: Mark for review, will appear in future sessions

## Quick Start

### Local Development
1. Open `index.html` in your browser
2. Start learning!

### Docker Deployment (Recommended for VPS)

#### Build and run with Docker Compose:
```bash
docker-compose up -d
```

The app will be available at `http://localhost:8080`

#### Or build manually:
```bash
# Build the image
docker build -t word-learning-game .

# Run the container
docker run -d -p 8080:80 --name word-learning-game word-learning-game
```

### VPS Deployment with Domain

1. **Copy files to your VPS:**
```bash
scp -r /path/to/words_app user@your-vps-ip:/opt/word-learning-game
```

2. **SSH into your VPS:**
```bash
ssh user@your-vps-ip
cd /opt/word-learning-game
```

3. **Start the container:**
```bash
docker-compose up -d
```

4. **Configure reverse proxy (Nginx on host):**

Create `/etc/nginx/sites-available/words.yourdomain.com`:
```nginx
server {
    listen 80;
    server_name words.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/words.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. **Add SSL with Let's Encrypt (recommended):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d words.yourdomain.com
```

## Container Management

### View logs:
```bash
docker logs word-learning-game
```

### Stop the container:
```bash
docker-compose down
```

### Restart the container:
```bash
docker-compose restart
```

### Update the app:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Data Structure

The app uses `words_with_examples.json` with the following structure:
```json
[
  {
    "word": "example",
    "meaning": "a thing characteristic of its kind or illustrating a general rule",
    "level": "A1",
    "sample_sentence": "This is an example sentence."
  }
]
```

## Browser Storage

Progress data is stored in localStorage under the key `wordLearningProgress`:
- Current learning level
- List of known words
- List of words marked for review
- Progress statistics per level

**Note:** Progress is browser-specific. Using a different browser or clearing browser data will reset progress.

## Optimization Features

### Frontend
- Vanilla JavaScript (no dependencies, fast loading)
- Minimal CSS with responsive design
- Efficient localStorage operations
- Only loads necessary words per session

### Backend (Nginx)
- Gzip compression enabled
- Static asset caching (1 year)
- JSON data caching (1 hour)
- Security headers included

## File Structure
```
words_app/
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # Application logic
├── words_with_examples.json # Word database
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf              # Nginx server configuration
└── README.md               # This file
```

## Port Configuration

Default port is `8080`. To change it, edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"
```

## Troubleshooting

### Container won't start
```bash
# Check if port is already in use
sudo lsof -i :8080

# View detailed logs
docker logs word-learning-game -f
```

### Can't access the app
1. Check if container is running: `docker ps`
2. Check firewall rules: `sudo ufw status`
3. Allow port: `sudo ufw allow 8080`

### Reset all progress
Open browser console and run:
```javascript
localStorage.removeItem('wordLearningProgress');
location.reload();
```

Or use the "Reset All Progress" button in the Statistics screen.

## License

MIT

## Credits

Word data from Oxford 3000 and Oxford 5000 word lists.
