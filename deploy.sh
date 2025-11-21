#!/bin/bash

# Joystick.ee VPS Deployment Script
# This script automates the deployment process

set -e

echo "=========================================="
echo "Joystick.ee VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# Step 2: Install Node.js
echo -e "${YELLOW}Step 2: Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}Node.js already installed${NC}"
fi

# Step 3: Install pnpm
echo -e "${YELLOW}Step 3: Installing pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
else
    echo -e "${GREEN}pnpm already installed${NC}"
fi

# Step 4: Install MySQL
echo -e "${YELLOW}Step 4: Installing MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
else
    echo -e "${GREEN}MySQL already installed${NC}"
fi

# Step 5: Install PM2
echo -e "${YELLOW}Step 5: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# Step 6: Install Nginx
echo -e "${YELLOW}Step 6: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# Step 7: Install Certbot
echo -e "${YELLOW}Step 7: Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}Certbot already installed${NC}"
fi

# Step 8: Setup app directory
echo -e "${YELLOW}Step 8: Setting up application directory...${NC}"
mkdir -p ~/apps
cd ~/apps

# Step 9: Clone repository
echo -e "${YELLOW}Step 9: Cloning repository...${NC}"
if [ ! -d "joystickk" ]; then
    read -p "Enter your GitHub username: " github_user
    git clone https://github.com/${github_user}/joystickk.git
else
    echo -e "${GREEN}Repository already cloned${NC}"
    cd joystickk
    git pull origin main
fi

cd ~/apps/joystickk

# Step 10: Install dependencies
echo -e "${YELLOW}Step 10: Installing dependencies...${NC}"
pnpm install

# Step 11: Create environment file
echo -e "${YELLOW}Step 11: Setting up environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    
    read -p "Enter database password: " db_password
    read -p "Enter your domain (e.g., joystick.com): " domain
    read -p "Enter Manus App ID: " manus_app_id
    read -p "Enter JWT Secret (or press Enter to generate): " jwt_secret
    
    if [ -z "$jwt_secret" ]; then
        jwt_secret=$(openssl rand -base64 32)
    fi
    
    cat > .env.local << EOF
# Database
DATABASE_URL="mysql://joystick_user:${db_password}@localhost:3306/joystick_store"

# JWT Secret
JWT_SECRET="${jwt_secret}"

# Manus OAuth
VITE_APP_ID="${manus_app_id}"
VITE_APP_TITLE="Joystick.ee"
VITE_APP_LOGO="/logo.svg"

# OAuth URLs
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Owner info
OWNER_NAME="Admin"
OWNER_OPEN_ID="your-manus-open-id"

# Manus APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-api-key"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"
EOF
    
    echo -e "${GREEN}.env.local created${NC}"
else
    echo -e "${GREEN}.env.local already exists${NC}"
fi

# Step 12: Setup database
echo -e "${YELLOW}Step 12: Setting up database...${NC}"
read -p "Have you created the MySQL database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pnpm db:push
else
    echo -e "${YELLOW}Please create the database first:${NC}"
    echo "sudo mysql -u root -p"
    echo "CREATE DATABASE joystick_store;"
    echo "CREATE USER 'joystick_user'@'localhost' IDENTIFIED BY 'your_password';"
    echo "GRANT ALL PRIVILEGES ON joystick_store.* TO 'joystick_user'@'localhost';"
    echo "FLUSH PRIVILEGES;"
    echo "EXIT;"
fi

# Step 13: Build project
echo -e "${YELLOW}Step 13: Building project...${NC}"
pnpm build

# Step 14: Setup PM2
echo -e "${YELLOW}Step 14: Setting up PM2...${NC}"
mkdir -p logs

cat > ecosystem.config.js << 'EOF'
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

pm2 start ecosystem.config.js
pm2 startup
pm2 save

# Step 15: Setup Nginx
echo -e "${YELLOW}Step 15: Setting up Nginx...${NC}"
read -p "Enter your domain: " domain

sudo tee /etc/nginx/sites-available/joystick-store > /dev/null << EOF
server {
    listen 80;
    server_name ${domain} www.${domain};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/joystick-store /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Step 16: Setup SSL
echo -e "${YELLOW}Step 16: Setting up SSL certificate...${NC}"
read -p "Enter your email for SSL certificate: " email
sudo certbot --nginx -d ${domain} -d www.${domain} --email ${email} --agree-tos --non-interactive

echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo -e "Your site is now live at: ${GREEN}https://${domain}${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs joystick-store       - View application logs"
echo "  pm2 restart joystick-store    - Restart application"
echo "  pm2 stop joystick-store       - Stop application"
echo "  pm2 status                    - Check status"
echo ""
echo "To update your application:"
echo "  cd ~/apps/joystickk"
echo "  git pull origin main"
echo "  pnpm install"
echo "  pnpm build"
echo "  pm2 restart joystick-store"
echo "=========================================="
