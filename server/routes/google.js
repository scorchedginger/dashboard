import express from 'express';
import { GoogleSearchConsoleService } from '../services/googleSearchConsoleService.js';
import { GoogleAdsService } from '../services/googleAdsService.js';

const router = express.Router();

// Google Search Console routes
router.get('/search-console/sites', async (req, res) => {
  try {
    const sites = await GoogleSearchConsoleService.getSites();
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search-console/performance', async (req, res) => {
  try {
    const { siteUrl, period = '7d' } = req.query;
    const performance = await GoogleSearchConsoleService.getPerformance(siteUrl, period);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search-console/queries', async (req, res) => {
  try {
    const { siteUrl, period = '7d', limit = 100 } = req.query;
    const queries = await GoogleSearchConsoleService.getTopQueries(siteUrl, period, limit);
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google Ads routes
router.get('/ads/accounts', async (req, res) => {
  try {
    const accounts = await GoogleAdsService.getAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ads/campaigns', async (req, res) => {
  try {
    const { accountId, period = '7d' } = req.query;
    const campaigns = await GoogleAdsService.getCampaigns(accountId, period);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ads/performance', async (req, res) => {
  try {
    const { accountId, period = '7d' } = req.query;
    const performance = await GoogleAdsService.getPerformance(accountId, period);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as googleRoutes };