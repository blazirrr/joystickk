# Joystick.ee VPS Deployment Guide

Complete step-by-step guide to deploy Joystick.ee on your Ubuntu VPS.

## Prerequisites

- Ubuntu 20.04 or later
- SSH access to your VPS
- Domain name (optional, but recommended)
- Root or sudo privileges

## Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

## Step 2: Install Node.js (v18+)

```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 3: Install pnpm (Package Manager)

```bash
npm install -g pnpm

# Verify installation
pnpm --version
```

## Step 4: Install MySQL Database

```bash
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL (optional but recommended)
sudo mysql_secure_installation
```

## Step 5: Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p

# Run these SQL commands:
CREATE DATABASE joystick_store;
CREATE USER 'joystick_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON joystick_store.* TO 'joystick_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Save your credentials:**
- Database: `joystick_store`
- Username: `joystick_user`
- Password: `your_secure_password_here`

## Step 6: Clone Your Repository

```bash
# Create app directory
mkdir -p ~/apps
cd ~/apps

# Clone your GitHub repository
git clone https://github.com/yourusername/joystickk.git
cd joystickk

# Or if you have the project files, upload them via SCP
# scp -r ./joystick-store user@your-vps-ip:/home/user/apps/
```

## Step 7: Install Dependencies

```bash
cd ~/apps/joystickk
pnpm install
```

## Step 8: Create Environment File

```bash
# Create .env.local file
nano .env.local
```

**Paste this content and update with your values:**

```env
# Database
DATABASE_URL="mysql://joystick_user:your_secure_password_here@localhost:3306/joystick_store"

# JWT Secret (generate a random string)
JWT_SECRET="your-random-secret-key-here-min-32-chars"

# Manus OAuth (get these from Manus dashboard)
VITE_APP_ID="your-manus-app-id"
VITE_APP_TITLE="Joystick.ee"
VITE_APP_LOGO="/logo.svg"

# OAuth URLs
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Owner info
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your-manus-open-id"

# Manus APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-api-key"

# Stripe (if using payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"
```

**To generate a secure JWT_SECRET:**
```bash
openssl rand -base64 32
```

**Save the file:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

## Step 9: Setup Database Schema

```bash
cd ~/apps/joystickk

# Run database migrations
pnpm db:push
```

## Step 10: Build the Project

```bash
cd ~/apps/joystickk
pnpm build
```

## Step 11: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ~/apps/joystickk/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'joystick-store',
      script: 'pnpm',
      args: 'start',
      cwd: '/home/ubuntu/apps/joystickk',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/apps/joystickk/logs/error.log',
      out_file: '/home/ubuntu/apps/joystickk/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Create logs directory
mkdir -p ~/apps/joystickk/logs
```

## Step 12: Start Application with PM2

```bash
cd ~/apps/joystickk

# Start the app
pm2 start ecosystem.config.js

# Setup PM2 to restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs joystick-store
```

## Step 13: Install and Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/joystick-store
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for WebSocket
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

**Enable the site:**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/joystick-store /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 14: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
sudo systemctl enable certbot.timer
```

## Step 15: Verify Installation

```bash
# Check if app is running
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Test your domain
curl https://your-domain.com

# View application logs
pm2 logs joystick-store
```

## Maintenance Commands

### View Logs
```bash
pm2 logs joystick-store
pm2 logs joystick-store --lines 100
```

### Restart Application
```bash
pm2 restart joystick-store
```

### Stop Application
```bash
pm2 stop joystick-store
```

### Update Application

```bash
cd ~/apps/joystickk

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Build
pnpm build

# Restart PM2
pm2 restart joystick-store
```

### Monitor Application
```bash
pm2 monit
```

## Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Database Connection Error
```bash
# Test MySQL connection
mysql -u joystick_user -p -h localhost joystick_store

# Check MySQL service
sudo systemctl status mysql
```

### Nginx Not Working
```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check Nginx config
sudo nginx -t
```

### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

## Performance Tips

1. **Enable Gzip compression** in Nginx:
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

2. **Set up database backups:**
```bash
# Daily backup
0 2 * * * mysqldump -u joystick_user -p'password' joystick_store > /backups/joystick_$(date +\%Y\%m\%d).sql
```

3. **Monitor disk space:**
```bash
df -h
du -sh ~/apps/joystickk
```

## Support

For issues or questions:
- Check logs: `pm2 logs joystick-store`
- Check Nginx: `sudo tail -f /var/log/nginx/error.log`
- Check MySQL: `sudo tail -f /var/log/mysql/error.log`

---

**Deployment Complete!** Your Joystick.ee store is now live at `https://your-domain.com`
