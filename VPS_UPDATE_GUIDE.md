# VPS Update Guide - How to Delete Old Files and Push New Ones

Complete guide for updating your Joystick.ee application on your VPS.

## Option 1: Using Git (Recommended if you have GitHub repo)

This is the cleanest way if your code is in GitHub.

### Step 1: SSH into your VPS

```bash
ssh user@your-vps-ip
cd ~/apps/joystickk
```

### Step 2: Pull Latest Changes from GitHub

```bash
# Fetch latest changes from GitHub
git fetch origin

# Switch to main branch
git checkout main

# Pull latest code
git pull origin main
```

### Step 3: Reinstall Dependencies

```bash
pnpm install
```

### Step 4: Run Database Migrations

```bash
pnpm db:push
```

### Step 5: Rebuild the Project

```bash
pnpm build
```

### Step 6: Restart the Application

```bash
pm2 restart joystick-store
```

### Step 7: Verify It's Running

```bash
pm2 logs joystick-store
```

---

## Option 2: Using SCP (Copy Files Directly)

Use this if you don't have a GitHub repo or want to manually upload files.

### From Your Local Machine:

```bash
# Delete old app directory on VPS
ssh user@your-vps-ip "rm -rf ~/apps/joystickk"

# Copy new project to VPS
scp -r ./joystick-store user@your-vps-ip:~/apps/joystickk

# SSH into VPS and setup
ssh user@your-vps-ip
cd ~/apps/joystickk

# Install and build
pnpm install
pnpm db:push
pnpm build

# Restart app
pm2 restart joystick-store
```

---

## Option 3: Clean Update (Remove Everything and Fresh Install)

Use this if you want to completely clean up old files.

### Step 1: Stop the Application

```bash
ssh user@your-vps-ip

# Stop PM2 app
pm2 stop joystick-store

# Delete the entire app directory
rm -rf ~/apps/joystickk
```

### Step 2: Clone Fresh Repository

```bash
cd ~/apps
git clone https://github.com/yourusername/joystickk.git
cd joystickk
```

### Step 3: Setup Environment

```bash
# Create .env.local
nano .env.local

# Paste your environment variables
# Press Ctrl+O, Enter, Ctrl+X to save
```

### Step 4: Install and Build

```bash
pnpm install
pnpm db:push
pnpm build
```

### Step 5: Start Application

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Option 4: Using SFTP (Graphical File Transfer)

If you prefer a graphical interface:

### Using FileZilla:

1. Download FileZilla: https://filezilla-project.org/
2. Open FileZilla and connect to your VPS:
   - Host: `sftp://your-vps-ip`
   - Username: `your-username`
   - Password: `your-password`
   - Port: `22`

3. Navigate to `~/apps/joystickk`
4. Delete old files (right-click → Delete)
5. Drag and drop new files from your local machine
6. SSH into VPS and run:
   ```bash
   cd ~/apps/joystickk
   pnpm install
   pnpm build
   pm2 restart joystick-store
   ```

---

## Quick Update Script

Save this as `update-vps.sh` on your local machine and run it:

```bash
#!/bin/bash

VPS_USER="your-username"
VPS_IP="your-vps-ip"
VPS_PATH="~/apps/joystickk"

echo "Starting VPS update..."

# SSH into VPS and update
ssh ${VPS_USER}@${VPS_IP} << 'EOF'
  cd ${VPS_PATH}
  
  echo "Stopping application..."
  pm2 stop joystick-store
  
  echo "Pulling latest changes..."
  git fetch origin
  git pull origin main
  
  echo "Installing dependencies..."
  pnpm install
  
  echo "Running migrations..."
  pnpm db:push
  
  echo "Building project..."
  pnpm build
  
  echo "Restarting application..."
  pm2 restart joystick-store
  
  echo "Update complete!"
  pm2 logs joystick-store
EOF
```

Make it executable:
```bash
chmod +x update-vps.sh
```

Run it:
```bash
./update-vps.sh
```

---

## Troubleshooting

### Port Already in Use
```bash
ssh user@your-vps-ip
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart joystick-store
```

### Permission Denied
```bash
# Fix permissions
sudo chown -R $USER:$USER ~/apps/joystickk
```

### Disk Space Issues
```bash
# Check disk space
df -h

# Clean up old node_modules
rm -rf ~/apps/joystickk/node_modules
pnpm install
```

### Database Connection Failed
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify .env.local has correct DATABASE_URL
cat ~/apps/joystickk/.env.local | grep DATABASE_URL
```

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs joystick-store

# Check for errors
pm2 status

# Try restarting
pm2 restart joystick-store --force
```

---

## Best Practice Workflow

1. **Make changes locally** and test them
2. **Commit to GitHub** (if using git):
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

3. **Update VPS** using Option 1 (Git):
   ```bash
   ssh user@your-vps-ip
   cd ~/apps/joystickk
   git pull origin main
   pnpm install
   pnpm build
   pm2 restart joystick-store
   ```

4. **Verify** the update worked:
   ```bash
   pm2 logs joystick-store
   curl https://your-domain.com
   ```

---

## Important Notes

⚠️ **Always backup before major updates:**
```bash
ssh user@your-vps-ip
tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/apps/joystickk
```

✅ **Keep .env.local safe:**
- Never delete `.env.local` when updating
- Never commit `.env.local` to Git
- Keep a backup of your environment variables

✅ **Database migrations:**
- Always run `pnpm db:push` after pulling new code
- This updates your database schema if needed

✅ **Zero-downtime updates:**
- PM2 handles graceful restarts
- Existing connections complete before restart
- New connections use updated code

---

## Quick Commands Reference

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to app
cd ~/apps/joystickk

# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Update database
pnpm db:push

# Build project
pnpm build

# Restart app
pm2 restart joystick-store

# View logs
pm2 logs joystick-store

# Check status
pm2 status

# Stop app
pm2 stop joystick-store

# Start app
pm2 start ecosystem.config.js

# Delete old files
rm -rf ~/apps/joystickk

# Check disk space
df -h

# Check running processes
ps aux | grep node
```

---

That's it! Choose the option that works best for your workflow.
