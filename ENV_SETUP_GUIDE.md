# Environment Variables Setup Guide

Complete guide to create and configure your `.env.local` file for Joystick.ee.

## Step 1: Create the .env.local File

Navigate to your project directory and create the file:

```bash
cd ~/apps/joystickk
nano .env.local
```

Or create it with this command:

```bash
touch .env.local
```

## Step 2: Generate Required Values

### 2.1 Generate JWT_SECRET

Generate a secure random string for JWT_SECRET:

```bash
openssl rand -base64 32
```

Copy the output - you'll need this in your `.env.local`

Example output:
```
aBcDeFgHiJkLmNoPqRsT+UvWxYz/1234567890==
```

### 2.2 Database Password

Create a strong password for your MySQL database. You can generate one:

```bash
openssl rand -base64 16
```

Example:
```
MySecurePassword123!@#
```

## Step 3: Get Manus Credentials

You need to get these from the Manus dashboard:

1. Go to https://dashboard.manus.im
2. Create a new application or use existing one
3. Get these values:
   - **VITE_APP_ID** - Your application ID
   - **OWNER_OPEN_ID** - Your user ID
   - **OWNER_NAME** - Your name
   - **BUILT_IN_FORGE_API_KEY** - API key for backend
   - **VITE_FRONTEND_FORGE_API_KEY** - API key for frontend

## Step 4: Complete .env.local Template

Copy and paste this into your `.env.local` file and fill in your values:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="mysql://joystick_user:YOUR_DB_PASSWORD@localhost:3306/joystick_store"

# ============================================
# JWT & SECURITY
# ============================================
JWT_SECRET="YOUR_JWT_SECRET_HERE"

# ============================================
# MANUS OAUTH CONFIGURATION
# ============================================
VITE_APP_ID="your-manus-app-id"
VITE_APP_TITLE="Joystick.ee"
VITE_APP_LOGO="/logo.svg"

# ============================================
# OAUTH URLs
# ============================================
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# ============================================
# OWNER INFORMATION
# ============================================
OWNER_NAME="Your Name Here"
OWNER_OPEN_ID="your-manus-open-id"

# ============================================
# MANUS BUILT-IN APIs
# ============================================
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-api-key"

# ============================================
# STRIPE (Optional - for payments)
# ============================================
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"

# ============================================
# ANALYTICS (Optional)
# ============================================
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"
```

## Step 5: Fill in Your Values

Replace the placeholder values with your actual values:

| Variable | Where to Get It | Example |
|----------|-----------------|---------|
| `YOUR_DB_PASSWORD` | You created this | `MySecurePassword123!@#` |
| `YOUR_JWT_SECRET_HERE` | Generated with openssl | `aBcDeFgHiJkLmNoPqRsT+UvWxYz/1234567890==` |
| `your-manus-app-id` | Manus Dashboard | `app_1234567890abcdef` |
| `Your Name Here` | Your name | `John Doe` |
| `your-manus-open-id` | Manus Dashboard | `user_abcdef1234567890` |
| `your-forge-api-key` | Manus Dashboard | `forge_key_xxxxx` |
| `your-frontend-api-key` | Manus Dashboard | `forge_key_frontend_xxxxx` |

## Step 6: Quick Setup Script

If you want to create the `.env.local` file quickly, use this script:

```bash
#!/bin/bash

# Create .env.local with your values
cat > .env.local << 'EOF'
# Database
DATABASE_URL="mysql://joystick_user:MySecurePassword123@localhost:3306/joystick_store"

# JWT Secret
JWT_SECRET="aBcDeFgHiJkLmNoPqRsT+UvWxYz/1234567890=="

# Manus OAuth
VITE_APP_ID="app_1234567890abcdef"
VITE_APP_TITLE="Joystick.ee"
VITE_APP_LOGO="/logo.svg"

# OAuth URLs
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Owner info
OWNER_NAME="John Doe"
OWNER_OPEN_ID="user_abcdef1234567890"

# Manus APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="forge_key_xxxxx"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="forge_key_frontend_xxxxx"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"
EOF

echo ".env.local created successfully!"
```

## Step 7: Verify Your .env.local

Check that the file was created correctly:

```bash
cat .env.local
```

You should see all your environment variables.

## Step 8: Important Security Notes

⚠️ **NEVER:**
- Commit `.env.local` to Git (add it to `.gitignore`)
- Share your `.env.local` file
- Expose your secret keys publicly
- Use the same JWT_SECRET across multiple environments

✅ **DO:**
- Keep `.env.local` on your server only
- Use strong, unique passwords
- Rotate API keys regularly
- Use different keys for development and production

## Step 9: Test Your Configuration

After creating `.env.local`, test it:

```bash
# Check if the file exists
ls -la .env.local

# Verify database connection
pnpm db:push

# If successful, you'll see database migrations applied
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Make sure MySQL is running:
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### Missing Environment Variables
```
Error: VITE_APP_ID is not defined
```
**Solution:** Make sure all required variables are in `.env.local` and restart your app:
```bash
pnpm build
pnpm start
```

### Wrong Database Password
```
Error: Access denied for user 'joystick_user'@'localhost'
```
**Solution:** Verify your database password is correct in `DATABASE_URL`

## Environment Variables Reference

### Required Variables
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - Manus application ID
- `OWNER_OPEN_ID` - Owner's Manus user ID

### Optional Variables
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For payment webhooks
- `VITE_STRIPE_PUBLISHABLE_KEY` - For frontend payments
- `VITE_ANALYTICS_ENDPOINT` - For analytics tracking
- `VITE_ANALYTICS_WEBSITE_ID` - Website ID for analytics

## Next Steps

After creating `.env.local`:

1. Run `pnpm install` to install dependencies
2. Run `pnpm db:push` to set up database
3. Run `pnpm build` to build the project
4. Run `pnpm start` to start the server

Your Joystick.ee store will be ready to use! 🎉
