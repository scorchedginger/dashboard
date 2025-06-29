import express from 'express';

const router = express.Router();

// Get all businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await req.businessManager.getAllBusinesses();
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific business
router.get('/:id', async (req, res) => {
  try {
    const business = await req.businessManager.getBusiness(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new business
router.post('/', async (req, res) => {
  try {
    const business = await req.businessManager.createBusiness(req.body);
    res.status(201).json(business);
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a business
router.put('/:id', async (req, res) => {
  try {
    const business = await req.businessManager.updateBusiness(req.params.id, req.body);
    res.json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    if (error.message === 'Business not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete a business
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await req.businessManager.deleteBusiness(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Business deleted successfully' });
    } else {
      res.status(404).json({ error: 'Business not found' });
    }
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test API connections
router.post('/:id/test/:platform', async (req, res) => {
  try {
    const { id, platform } = req.params;
    const business = await req.businessManager.getBusiness(id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    let result = { status: 'not_configured', message: 'Platform not configured' };

    switch (platform) {
      case 'bigcommerce':
        if (business.bigcommerce?.enabled && business.bigcommerce?.storeHash && business.bigcommerce?.accessToken) {
          try {
            // Test BigCommerce connection
            const response = await fetch(`https://api.bigcommerce.com/stores/${business.bigcommerce.storeHash}/v3/catalog/products`, {
              headers: {
                'X-Auth-Token': business.bigcommerce.accessToken,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              result = { status: 'connected', message: 'BigCommerce connection successful' };
            } else {
              result = { status: 'error', message: 'BigCommerce authentication failed' };
            }
          } catch (error) {
            result = { status: 'error', message: 'BigCommerce connection failed' };
          }
        }
        break;

      case 'google':
        if (business.google?.enabled && business.google?.clientId && business.google?.clientSecret) {
          result = { status: 'connected', message: 'Google credentials configured (requires OAuth flow)' };
        }
        break;

      case 'googleAnalytics':
        if (business.googleAnalytics?.enabled && business.googleAnalytics?.propertyId) {
          result = { status: 'connected', message: 'Google Analytics configured (requires OAuth flow)' };
        }
        break;

      case 'meta':
        if (business.meta?.enabled && business.meta?.appId && business.meta?.appSecret) {
          result = { status: 'connected', message: 'Meta credentials configured (requires OAuth flow)' };
        }
        break;

      default:
        result = { status: 'error', message: 'Unknown platform' };
    }

    res.json(result);
  } catch (error) {
    console.error('Error testing API connection:', error);
    res.status(500).json({ error: 'Failed to test connection' });
  }
});

// Get business configuration for a specific platform
router.get('/:id/config/:platform', async (req, res) => {
  try {
    const config = await req.businessManager.getBusinessConfig(req.params.id, req.params.platform);
    res.json(config);
  } catch (error) {
    console.error('Error fetching business config:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as businessRoutes }; 