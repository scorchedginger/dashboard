import axios from 'axios';

export class BigCommerceAuth {
  static async testConnection() {
    try {
      if (!process.env.BIGCOMMERCE_STORE_HASH || !process.env.BIGCOMMERCE_ACCESS_TOKEN) {
        return { 
          status: 'error', 
          message: 'BigCommerce credentials not configured. Please set BIGCOMMERCE_STORE_HASH and BIGCOMMERCE_ACCESS_TOKEN environment variables.' 
        };
      }

      const response = await axios.get(
        `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/time`,
        {
          headers: {
            'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return { 
        status: 'connected', 
        message: 'BigCommerce API connection successful',
        storeTime: response.data.time
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: `BigCommerce API Error: ${error.response?.status} - ${error.response?.statusText || error.message}` 
      };
    }
  }

  static getWebhookUrl() {
    return `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/bigcommerce/webhook`;
  }

  static async setupWebhooks() {
    try {
      const webhookEvents = [
        'store/order/created',
        'store/order/updated',
        'store/product/created',
        'store/product/updated'
      ];

      const webhookUrl = this.getWebhookUrl();
      const results = [];

      for (const scope of webhookEvents) {
        try {
          const response = await axios.post(
            `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/hooks`,
            {
              scope,
              destination: webhookUrl,
              is_active: true
            },
            {
              headers: {
                'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          results.push({ scope, status: 'created', id: response.data.id });
        } catch (error) {
          results.push({ scope, status: 'error', message: error.response?.data?.title || error.message });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Webhook setup failed: ${error.message}`);
    }
  }
}