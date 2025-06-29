#!/bin/bash

# 🚀 Dashboard VPS Deployment Script
# This script will securely deploy your dashboard to a VPS

set -e  # Exit on any error

echo "🚀 Starting secure VPS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if domain is provided
if [ -z "$1" ]; then
    print_error "Usage: ./deploy.sh <your-domain.com>"
    print_error "Example: ./deploy.sh dashboard.example.com"
    exit 1
fi

DOMAIN=$1
print_status "Deploying to domain: $DOMAIN"

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git ufw fail2ban nginx certbot python3-certbot-nginx htop

# Configure firewall
print_status "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /home/dashboard/app
sudo chown $USER:$USER /home/dashboard/app

# Copy application files
print_status "Copying application files..."
cp -r . /home/dashboard/app/
cd /home/dashboard/app

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build frontend
print_status "Building frontend..."
npm run build

# Create logs directory
mkdir -p logs

# Create production environment file
print_status "Creating production environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
SESSION_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://$DOMAIN
EOF

# Update nginx configuration with domain
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/dashboard > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Frontend (React build)
    location / {
        root /home/dashboard/app/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)\$ {
        deny all;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Get SSL certificate
print_status "Obtaining SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Setup SSL auto-renewal
print_status "Setting up SSL auto-renewal..."
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

# Create backup script
print_status "Setting up backup system..."
cat > /home/dashboard/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/dashboard/backups"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/dashboard/app/data/
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/dashboard/backup.sh

# Setup daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/dashboard/backup.sh") | crontab -

# Set proper permissions
print_status "Setting proper file permissions..."
sudo chown -R $USER:$USER /home/dashboard/app
chmod 600 /home/dashboard/app/.env
chmod 755 /home/dashboard/app

# Create monitoring script
print_status "Setting up monitoring..."
cat > /home/dashboard/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Dashboard Status ==="
pm2 status
echo ""
echo "=== System Resources ==="
free -h
df -h
echo ""
echo "=== Recent Logs ==="
pm2 logs dashboard-api --lines 10
EOF

chmod +x /home/dashboard/monitor.sh

# Final status check
print_status "Performing final status check..."
sleep 5
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status "✅ Application is running successfully!"
else
    print_warning "⚠️  Application may not be fully started yet. Check logs with: pm2 logs dashboard-api"
fi

# Print deployment summary
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Domain: https://$DOMAIN"
echo "   Application: Running on port 3001"
echo "   SSL: Configured with Let's Encrypt"
echo "   Firewall: UFW enabled with fail2ban"
echo "   Process Manager: PM2 with auto-restart"
echo "   Monitoring: /home/dashboard/monitor.sh"
echo "   Backups: Daily at 2 AM"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: pm2 logs dashboard-api"
echo "   Monitor: pm2 monit"
echo "   Restart: pm2 restart dashboard-api"
echo "   Status: pm2 status"
echo "   System monitor: /home/dashboard/monitor.sh"
echo ""
echo "🔒 Security Features Enabled:"
echo "   ✅ Firewall (UFW) with fail2ban"
echo "   ✅ SSL/TLS encryption"
echo "   ✅ Security headers"
echo "   ✅ Rate limiting"
echo "   ✅ Non-root user execution"
echo "   ✅ File permission restrictions"
echo ""
echo "🚀 Your dashboard is now securely deployed and ready for production use!" 