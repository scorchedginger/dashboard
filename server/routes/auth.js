import express from 'express';
import { GoogleAuth } from '../services/googleAuth.js';
import { MetaAuth } from '../services/metaAuth.js';
import { BigCommerceAuth } from '../services/bigcommerceAuth.js';

const router = express.Router();

// Google OAuth routes
router.get('/google/url', async (req, res) => {
  try {
    const authUrl = GoogleAuth.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    const tokens = await GoogleAuth.getTokens(code);
    // Store tokens securely (in production, use encrypted storage)
    res.json({ success: true, message: 'Google authentication successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Meta OAuth routes
router.get('/meta/url', async (req, res) => {
  try {
    const authUrl = MetaAuth.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/meta/callback', async (req, res) => {
  try {
    const { code } = req.body;
    const tokens = await MetaAuth.getTokens(code);
    res.json({ success: true, message: 'Meta authentication successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// BigCommerce webhook endpoint
router.post('/bigcommerce/webhook', async (req, res) => {
  try {
    const { scope, data } = req.body;
    console.log('BigCommerce webhook received:', scope, data);
    
    // Trigger data refresh for relevant metrics
    if (scope.includes('order') || scope.includes('product')) {
      req.dataAggregator.invalidateCache('bigcommerce');
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Test API connections
router.get('/test/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    let result;

    switch (platform) {
      case 'bigcommerce':
        result = await BigCommerceAuth.testConnection();
        break;
      case 'google':
        result = await GoogleAuth.testConnection();
        break;
      case 'meta':
        result = await MetaAuth.testConnection();
        break;
      default:
        return res.status(400).json({ error: 'Invalid platform' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as authRoutes };