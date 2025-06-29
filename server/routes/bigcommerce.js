import express from 'express';
import { BigCommerceService } from '../services/bigcommerceService.js';

const router = express.Router();

// Get store information
router.get('/store', async (req, res) => {
  try {
    const storeInfo = await BigCommerceService.getStoreInfo();
    res.json(storeInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders data
router.get('/orders', async (req, res) => {
  try {
    const { period = '7d', limit = 50 } = req.query;
    const orders = await BigCommerceService.getOrders(period, limit);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products data
router.get('/products', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const products = await BigCommerceService.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const analytics = await BigCommerceService.getAnalytics(period);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as bigCommerceRoutes };