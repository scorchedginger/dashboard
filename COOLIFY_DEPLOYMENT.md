# 🚀 Coolify Deployment Guide

## Overview
This guide will help you deploy your marketing dashboard to Coolify with proper configuration and environment setup.

## Prerequisites
- Coolify instance running
- Git repository with your code
- Domain name (optional but recommended)
- API credentials for your integrations

## 📋 Deployment Steps

### 1. Repository Preparation
Your repository is already prepared with:
- ✅ Multi-stage Dockerfile
- ✅ Health checks
- ✅ Environment variable support
- ✅ Production build process

### 2. Coolify Application Setup

#### Step 1: Create New Application
1. Log into your Coolify dashboard
2. Click "New Application"
3. Select "Docker Compose" as the deployment method
4. Connect your Git repository

#### Step 2: Configure Application
- **Name**: `dashboard`
- **Repository**: Your Git repository URL
- **Branch**: `main` (or your preferred branch)
- **Docker Compose File**: `coolify-deploy.yml`

#### Step 3: Environment Variables
Add the following environment variables in Coolify:

**Required:**
```
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-super-secure-session-secret-here
```

**Optional (based on your integrations):**
```
# BigCommerce
BIGCOMMERCE_CLIENT_ID=your-client-id
BIGCOMMERCE_CLIENT_SECRET=your-client-secret
BIGCOMMERCE_STORE_HASH=your-store-hash

# Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_ANALYTICS_PROPERTY_ID=your-ga-property-id

# Meta/Facebook
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
```

#### Step 4: Domain Configuration
1. Add your domain in Coolify
2. Enable SSL (Coolify handles this automatically)
3. Set up any subdomains if needed

#### Step 5: Deploy
1. Click "Deploy" in Coolify
2. Monitor the build process
3. Check the logs for any issues

### 3. Post-Deployment Verification

#### Health Check
Your application includes a health check endpoint at `/api/health`. Verify it's working:
```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "bigcommerce": "configured",
    "google": "configured",
    "googleAnalytics": "configured",
    "meta": "configured"
  },
  "businesses": 0
}
```

#### API Endpoints
Verify these endpoints are accessible:
- Frontend: `https://yourdomain.com/`
- API Health: `https://yourdomain.com/api/health`
- Dashboard API: `https://yourdomain.com/api/dashboard`
- Business Management: `https://yourdomain.com/api/businesses`

### 4. Monitoring & Maintenance

#### Logs
- Access logs through Coolify dashboard
- Monitor for any errors or issues
- Check application performance

#### Updates
- Push changes to your Git repository
- Coolify will automatically rebuild and deploy
- Monitor the deployment process

#### Scaling
- Coolify supports horizontal scaling
- Adjust resources as needed
- Monitor resource usage

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check Docker build logs

#### 2. Environment Variables
- Ensure all required variables are set
- Check variable names match exactly
- Verify no extra spaces or quotes

#### 3. Port Issues
- Application runs on port 3000
- Coolify handles port mapping automatically
- Check health check configuration

#### 4. API Integration Issues
- Verify API credentials are correct
- Check CORS configuration
- Ensure proper redirect URIs are set

### Debug Commands
```bash
# Check application logs
docker logs dashboard-app

# Check health status
curl http://localhost:3000/api/health

# Check environment variables
docker exec dashboard-app env
```

## 📊 Performance Optimization

### 1. Caching
- Static assets are cached for 1 year
- API responses use cache manager
- Consider CDN for global performance

### 2. Database
- Current setup uses file-based storage
- Consider PostgreSQL for production scale
- Implement proper backup strategy

### 3. Monitoring
- Enable Coolify monitoring
- Set up alerts for downtime
- Monitor API rate limits

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit sensitive data to Git
- Use Coolify's secure environment variable storage
- Rotate secrets regularly

### 2. API Security
- Implement proper authentication
- Use HTTPS for all communications
- Monitor for suspicious activity

### 3. Container Security
- Application runs as non-root user
- Regular security updates
- Minimal attack surface

## 📈 Scaling Strategy

### 1. Horizontal Scaling
- Coolify supports multiple instances
- Load balancing handled automatically
- Monitor resource usage

### 2. Database Scaling
- Consider external database service
- Implement connection pooling
- Regular backups and maintenance

### 3. CDN Integration
- Use Cloudflare or similar CDN
- Cache static assets globally
- Reduce server load

## 🎯 Next Steps

1. **Deploy to Coolify** using the steps above
2. **Configure your domain** and SSL
3. **Set up monitoring** and alerts
4. **Test all integrations** thoroughly
5. **Monitor performance** and optimize as needed

## 📞 Support

If you encounter issues:
1. Check Coolify logs first
2. Verify environment variables
3. Test locally with Docker
4. Check API integration status
5. Review this deployment guide

Your dashboard should now be successfully deployed on Coolify! 🎉 