import express from 'express';
import { MetaAdsService } from '../services/metaAdsService.js';

const router = express.Router();

// Get ad accounts
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await MetaAdsService.getAdAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const { accountId, period = '7d' } = req.query;
    const campaigns = await MetaAdsService.getCampaigns(accountId, period);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ad performance
router.get('/performance', async (req, res) => {
  try {
    const { accountId, period = '7d' } = req.query;
    const performance = await MetaAdsService.getPerformance(accountId, period);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get insights
router.get('/insights', async (req, res) => {
  try {
    const { accountId, period = '7d', breakdown } = req.query;
    const insights = await MetaAdsService.getInsights(accountId, period, breakdown);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as metaRoutes };