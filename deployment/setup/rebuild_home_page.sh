#!/bin/bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

echo "Starting rebuild of home-page..."
cd /home/ubuntu/apps/home-page

# Ensure .env.local is gone
if [ -f .env.local ]; then
    echo "Removing .env.local..."
    rm .env.local
fi

# Update .env.production
echo "Updating .env.production..."
echo "NEXT_PUBLIC_API_URL=https://app.ezcollab.com" > .env.production

# Rebuild
echo "Running npm run build..."
npm run build

# Restart service
echo "Restarting service..."
sudo systemctl restart home-page

echo "Rebuild complete."
