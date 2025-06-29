# API Configuration Guide

## Setting Up Environment Variables

Create a `.env` file in the root directory of your project with the following variables:

```env
# Dashboard API Configuration
# ===========================

# Server Configuration
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001

# BigCommerce Configuration
# Get these from your BigCommerce store admin panel
BIGCOMMERCE_STORE_HASH=your_store_hash_here
BIGCOMMERCE_ACCESS_TOKEN=your_access_token_here

# Google Configuration (for Google Ads, Search Console, and Analytics)
# Get these from Google Cloud Console (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
GOOGLE_ACCESS_TOKEN=your_google_access_token_here
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here

# Google Analytics Configuration
# Get this from Google Analytics Admin panel
GOOGLE_ANALYTICS_PROPERTY_ID=your_analytics_property_id_here

# Meta/Facebook Configuration
# Get these from Meta for Developers (https://developers.facebook.com/)
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
META_REDIRECT_URI=http://localhost:3001/api/auth/meta/callback
META_ACCESS_TOKEN=your_meta_access_token_here
```

## How to Get API Keys

### BigCommerce
1. Log into your BigCommerce store admin panel
2. Go to **Settings** → **API** → **API Accounts**
3. Create a new API account or use an existing one
4. Copy the **Store Hash** (found in the API URL)
5. Generate an **Access Token** with the required scopes

### Google (Google Ads, Search Console & Analytics)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Ads API
   - Search Console API
   - Google Analytics Data API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set the redirect URI to: `http://localhost:3001/api/auth/google/callback`
6. Copy the **Client ID** and **Client Secret**

#### Google Analytics Property ID
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** → **Property Settings**
4. Copy the **Property ID** (format: 123456789)

### Meta/Facebook Ads
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add the **Facebook Login** product
4. Go to **Settings** → **Basic** to get your **App ID** and **App Secret**
5. Set the redirect URI to: `http://localhost:3001/api/auth/meta/callback`

## Testing Your Configuration

After setting up your `.env` file, restart the development server:

```bash
npm run dev
```

You can test the configuration by visiting:
- Health check: `http://localhost:3001/api/health`
- This will show which services are configured

## API Endpoints

### Dashboard
- `GET /api/dashboard/metrics` - Get aggregated metrics
- `GET /api/dashboard/platforms` - Get platform-specific data
- `GET /api/dashboard/charts` - Get chart data

### Business Management
- `GET /api/businesses` - List all businesses
- `POST /api/businesses` - Create new business
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business

### Google Analytics
- `GET /api/google-analytics/overview` - Get analytics overview
- `GET /api/google-analytics/traffic-sources` - Get traffic sources
- `GET /api/google-analytics/page-views` - Get page views data
- `GET /api/google-analytics/properties` - List available properties
- `POST /api/google-analytics/test` - Test connection

### Platform-Specific
- `GET /api/bigcommerce/*` - BigCommerce endpoints
- `GET /api/google/*` - Google Ads & Search Console endpoints
- `GET /api/meta/*` - Meta/Facebook endpoints

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and rotate them regularly
- For production, use a secure environment variable management system
- The `.env` file is already in `.gitignore` to prevent accidental commits 