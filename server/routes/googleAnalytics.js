import express from 'express';
import { GoogleAnalyticsService } from '../services/googleAnalyticsService.js';

const router = express.Router();

// Get Google Analytics overview data
router.get('/overview', async (req, res) => {
  try {
    const { 
      propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
      startDate = '7daysAgo',
      endDate = 'today',
      businessId 
    } = req.query;

    if (!propertyId) {
      return res.status(400).json({ error: 'Google Analytics Property ID is required' });
    }

    const data = await GoogleAnalyticsService.getAnalytics(propertyId, startDate, endDate, businessId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Google Analytics overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get traffic sources data
router.get('/traffic-sources', async (req, res) => {
  try {
    const { 
      propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
      startDate = '7daysAgo',
      endDate = 'today',
      businessId 
    } = req.query;

    if (!propertyId) {
      return res.status(400).json({ error: 'Google Analytics Property ID is required' });
    }

    const data = await GoogleAnalyticsService.getTrafficSources(propertyId, startDate, endDate, businessId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Google Analytics traffic sources:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get page views data
router.get('/page-views', async (req, res) => {
  try {
    const { 
      propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
      startDate = '7daysAgo',
      endDate = 'today',
      businessId 
    } = req.query;

    if (!propertyId) {
      return res.status(400).json({ error: 'Google Analytics Property ID is required' });
    }

    const data = await GoogleAnalyticsService.getPageViews(propertyId, startDate, endDate, businessId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Google Analytics page views:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test Google Analytics connection
router.post('/test', async (req, res) => {
  try {
    const { businessId } = req.body;
    const result = await GoogleAnalyticsService.testConnection(businessId);
    res.json(result);
  } catch (error) {
    console.error('Error testing Google Analytics connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available properties
router.get('/properties', async (req, res) => {
  try {
    const { businessId } = req.query;
    const config = await GoogleAnalyticsService.getBusinessConfig(businessId);
    
    if (!config) {
      return res.status(400).json({ error: 'Google Analytics not configured' });
    }

    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        access_token: config.accessToken
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
    const [response] = await analyticsData.properties.list();
    
    const properties = response.properties || [];
    res.json(properties.map(property => ({
      id: property.name.split('/')[1],
      displayName: property.displayName,
      currencyCode: property.currencyCode,
      timeZone: property.timeZone
    })));
  } catch (error) {
    console.error('Error fetching Google Analytics properties:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as googleAnalyticsRoutes }; 