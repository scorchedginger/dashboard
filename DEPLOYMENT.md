# 🚀 Secure VPS Deployment Guide

## Overview
This guide will help you deploy your marketing dashboard securely to a VPS with production-grade security, SSL, and monitoring.

## Prerequisites
- VPS with Ubuntu 20.04+ or CentOS 8+
- Root or sudo access
- Domain name (optional but recommended)
- SSH key authentication

## 🔒 Security Checklist

### 1. Server Hardening
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y ufw fail2ban nginx certbot python3-certbot-nginx

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. User Security
```bash
# Create dedicated user
sudo adduser dashboard
sudo usermod -aG sudo dashboard

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
sudo systemctl restart sshd

# Switch to dashboard user
su - dashboard
```

### 3. Install Node.js & PM2
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify installation
node --version
npm --version
pm2 --version
```

## 📦 Application Deployment

### 1. Clone & Setup
```bash
# Clone your repository
git clone <your-repo-url> /home/dashboard/app
cd /home/dashboard/app

# Install dependencies
npm install

# Build frontend
npm run build
```

### 2. Environment Configuration
```bash
# Create production environment file
nano .env

# Add your production environment variables:
NODE_ENV=production
PORT=3001
SESSION_SECRET=your-super-secure-session-secret-here
CORS_ORIGIN=https://yourdomain.com

# BigCommerce (if using)
BIGCOMMERCE_CLIENT_ID=your-client-id
BIGCOMMERCE_CLIENT_SECRET=your-client-secret

# Google (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Meta (if using)
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
```

### 3. PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'dashboard-api',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 4. Start Application
```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🌐 Nginx Configuration

### 1. Create Nginx Site
```bash
sudo nano /etc/nginx/sites-available/dashboard
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
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
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
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
    
    location ~ \.(env|log|sql)$ {
        deny all;
    }
}
```

### 2. Enable Site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔐 SSL Certificate

### 1. Install SSL with Let's Encrypt
```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 2. Auto-renewal Setup
```bash
# Add to crontab
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Logging

### 1. Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/dashboard
```

```
/home/dashboard/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 dashboard dashboard
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Install Monitoring Tools
```bash
# Install htop for system monitoring
sudo apt install htop

# Install netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 3. PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs dashboard-api

# Monitor system resources
pm2 status
```

## 🔄 Backup Strategy

### 1. Database Backup (if using)
```bash
# Create backup script
nano /home/dashboard/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/dashboard/backups"

mkdir -p $BACKUP_DIR

# Backup application data
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/dashboard/app/data/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 2. Setup Automated Backups
```bash
chmod +x /home/dashboard/backup.sh

# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM:
0 2 * * * /home/dashboard/backup.sh
```

## 🚨 Security Monitoring

### 1. Setup Security Alerts
```bash
# Monitor failed login attempts
sudo tail -f /var/log/auth.log | grep "Failed password"

# Monitor application errors
pm2 logs dashboard-api --err

# Monitor system resources
htop
```

### 2. Regular Security Updates
```bash
# Create update script
nano /home/dashboard/update.sh
```

```bash
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo npm update -g pm2
cd /home/dashboard/app
git pull
npm install
npm run build
pm2 restart dashboard-api
```

## 🔧 Maintenance Commands

### Application Management
```bash
# Restart application
pm2 restart dashboard-api

# View application status
pm2 status

# View logs
pm2 logs dashboard-api

# Monitor resources
pm2 monit
```

### System Management
```bash
# Check system resources
htop
df -h
free -h

# Check application status
sudo systemctl status nginx
sudo systemctl status fail2ban

# Check SSL certificate
sudo certbot certificates
```

## 🆘 Troubleshooting

### Common Issues

1. **Port 3001 not accessible**
   ```bash
   sudo ufw status
   sudo netstat -tlnp | grep 3001
   ```

2. **Nginx not serving files**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Application not starting**
   ```bash
   pm2 logs dashboard-api
   pm2 status
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot renew --force-renewal
   sudo systemctl restart nginx
   ```

## 📈 Performance Optimization

### 1. Enable Nginx Caching
```bash
# Add to nginx configuration
sudo nano /etc/nginx/sites-available/dashboard
```

```nginx
# Add this inside the server block
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}
```

### 2. Optimize Node.js
```bash
# Add to ecosystem.config.js
node_args: '--max-old-space-size=2048'
```

### 3. Database Optimization (if applicable)
- Enable connection pooling
- Setup proper indexes
- Regular maintenance

## 🔐 Additional Security Measures

### 1. Regular Security Audits
```bash
# Check for open ports
sudo netstat -tlnp

# Check for suspicious processes
ps aux | grep -v grep | grep -E "(crypto|miner)"

# Check for unauthorized SSH access
sudo tail -f /var/log/auth.log
```

### 2. File Permissions
```bash
# Secure application files
sudo chown -R dashboard:dashboard /home/dashboard/app
chmod 600 /home/dashboard/app/.env
chmod 755 /home/dashboard/app
```

### 3. Network Security
```bash
# Block common attack ports
sudo ufw deny 22/tcp
sudo ufw deny 23/tcp
sudo ufw deny 21/tcp
```

## 📞 Support & Monitoring

### 1. Setup Alerts
- Monitor disk space
- Monitor memory usage
- Monitor application uptime
- Monitor SSL certificate expiration

### 2. Documentation
- Keep deployment notes
- Document configuration changes
- Maintain backup procedures
- Record troubleshooting steps

---

## 🎯 Quick Deployment Checklist

- [ ] Server hardened with UFW and fail2ban
- [ ] Node.js and PM2 installed
- [ ] Application deployed and running
- [ ] Nginx configured with SSL
- [ ] Environment variables set
- [ ] Monitoring tools installed
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Log rotation configured

Your dashboard is now securely deployed and ready for production use! 🚀 