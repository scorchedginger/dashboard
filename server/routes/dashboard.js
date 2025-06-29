import express from 'express';

const router = express.Router();

// Get aggregated dashboard data for a specific business
router.get('/:businessId/metrics', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = '7d' } = req.query;
    
    // Get business configuration
    const business = await req.businessManager.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const metrics = await req.dataAggregator.getAggregatedMetrics(period, businessId);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get platform-specific data for a business
router.get('/:businessId/platforms', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = '7d' } = req.query;
    
    const business = await req.businessManager.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const platforms = await req.dataAggregator.getPlatformData(period, businessId);
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching platform data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chart data for a business
router.get('/:businessId/charts', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = '7d', type } = req.query;
    
    const business = await req.businessManager.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const chartData = await req.dataAggregator.getChartData(period, type, businessId);
    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Force refresh all data for a business
router.post('/:businessId/refresh', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await req.businessManager.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    await req.dataAggregator.refreshAllData(businessId);
    res.json({ success: true, message: 'Data refresh initiated' });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get real-time status for a business
router.get('/:businessId/status', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await req.businessManager.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const status = await req.dataAggregator.getSystemStatus(businessId);
    res.json(status);
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoints for backward compatibility (default to first business)
router.get('/metrics', async (req, res) => {
  try {
    const businesses = await req.businessManager.getAllBusinesses();
    if (businesses.length === 0) {
      return res.status(404).json({ error: 'No businesses configured' });
    }
    
    const businessId = businesses[0].id;
    const { period = '7d' } = req.query;
    const metrics = await req.dataAggregator.getAggregatedMetrics(period, businessId);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/platforms', async (req, res) => {
  try {
    const businesses = await req.businessManager.getAllBusinesses();
    if (businesses.length === 0) {
      return res.status(404).json({ error: 'No businesses configured' });
    }
    
    const businessId = businesses[0].id;
    const { period = '7d' } = req.query;
    const platforms = await req.dataAggregator.getPlatformData(period, businessId);
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching platform data:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const businesses = await req.businessManager.getAllBusinesses();
    if (businesses.length === 0) {
      return res.status(404).json({ error: 'No businesses configured' });
    }
    
    const businessId = businesses[0].id;
    const { period = '7d', type } = req.query;
    const chartData = await req.dataAggregator.getChartData(period, type, businessId);
    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const businesses = await req.businessManager.getAllBusinesses();
    if (businesses.length === 0) {
      return res.status(404).json({ error: 'No businesses configured' });
    }
    
    const businessId = businesses[0].id;
    await req.dataAggregator.refreshAllData(businessId);
    res.json({ success: true, message: 'Data refresh initiated' });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const businesses = await req.businessManager.getAllBusinesses();
    if (businesses.length === 0) {
      return res.status(404).json({ error: 'No businesses configured' });
    }
    
    const businessId = businesses[0].id;
    const status = await req.dataAggregator.getSystemStatus(businessId);
    res.json(status);
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as dashboardRoutes };