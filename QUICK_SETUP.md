# 🚀 Quick API Setup Guide

## Easy API Configuration

You now have a **one-click API configuration system**! Here's how to use it:

### 1. Start the Application
```bash
npm run dev
```

### 2. Access the Dashboard
- Frontend: http://localhost:5173 (or 5174 if 5173 is busy)
- Backend: http://localhost:3001

### 3. Configure Your APIs (Super Easy!)

1. **Click "Configure APIs"** button in the dashboard header
2. **Select your business** from the dropdown
3. **Fill in your API credentials** for each platform:
   - ✅ Enable/disable each platform
   - 🔒 Secure password fields for sensitive data
   - 🧪 Test connections with one click
   - 💾 Save all configurations at once

### 4. Supported Platforms

#### BigCommerce
- **Store Hash**: Found in your BigCommerce admin → Settings → API → Store API
- **Access Token**: Generate in BigCommerce admin → Settings → API → Store API

#### Google (Ads & Search Console)
- **Client ID**: From Google Cloud Console → APIs & Services → Credentials
- **Client Secret**: From Google Cloud Console → APIs & Services → Credentials

#### Google Analytics
- **Property ID**: Found in Google Analytics → Admin → Property Settings

#### Meta/Facebook Ads
- **App ID**: From Meta for Developers → Your App → Settings
- **App Secret**: From Meta for Developers → Your App → Settings

### 5. Test Your Connections

Each platform has a **"Test"** button that will:
- ✅ Verify your credentials are correct
- 🔄 Show real-time connection status
- ❌ Highlight any configuration issues

### 6. Multi-Business Support

- **Add multiple businesses** with different API configurations
- **Switch between businesses** instantly
- **Isolated data** for each business
- **Shared dashboard** with business-specific metrics

## 🎯 What You Get

After configuration, your dashboard will show:
- 📊 **Real-time metrics** from all connected platforms
- 📈 **Revenue tracking** across all channels
- 🎯 **Conversion data** from ads and analytics
- 📱 **Traffic sources** and performance
- 🔄 **Auto-refresh** every 5 minutes
- 📊 **Beautiful charts** and visualizations

## 🔧 Troubleshooting

### Port Issues
If you see "port already in use" errors:
```bash
# Kill existing processes
pkill -f "node server/index.js"
lsof -ti:3001 | xargs kill -9

# Restart
npm run dev
```

### API Connection Issues
1. **Check credentials** are correct
2. **Verify API permissions** are enabled
3. **Test connections** using the test buttons
4. **Check the console** for detailed error messages

### Missing Data
- **Wait 5 minutes** for initial data sync
- **Click "Refresh"** to force data update
- **Check API quotas** and rate limits

## 📚 Next Steps

1. **Configure your first business** with API credentials
2. **Test all connections** to ensure they work
3. **Explore the dashboard** and customize views
4. **Add more businesses** if needed
5. **Set up automated reporting** (coming soon)

## 🆘 Need Help?

- Check the `API_CONFIGURATION.md` file for detailed setup instructions
- Review the console logs for error messages
- Ensure all required environment variables are set
- Verify your API credentials have the correct permissions

---

**🎉 You're all set!** Your marketing dashboard is ready to provide insights across all your platforms. 