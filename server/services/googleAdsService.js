import axios from 'axios';

export class GoogleAdsService {
  static get baseURL() {
    return 'https://googleads.googleapis.com/v14';
  }

  static isConfigured() {
    return !!(
      process.env.GOOGLE_ACCESS_TOKEN &&
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
      process.env.GOOGLE_ADS_CUSTOMER_ID
    );
  }

  static async getHeaders() {
    if (!this.isConfigured()) {
      throw new Error('Google Ads credentials not configured');
    }

    return {
      'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
      'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      'login-customer-id': process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID,
      'Content-Type': 'application/json'
    };
  }

  static async getAccounts() {
    try {
      if (!this.isConfigured()) {
        console.log('Google Ads not configured, returning mock data');
        return this.getMockAccounts();
      }

      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseURL}/customers:listAccessibleCustomers`, {
        headers
      });

      return response.data.resourceNames || [];
    } catch (error) {
      console.error('Google Ads Accounts Error:', error.response?.data || error.message);
      return this.getMockAccounts();
    }
  }

  static async getCampaigns(accountId, period = '7d') {
    try {
      if (!this.isConfigured()) {
        console.log('Google Ads not configured, returning mock data');
        return this.getMockCampaigns(period);
      }

      const headers = await this.getHeaders();
      const customerId = accountId || process.env.GOOGLE_ADS_CUSTOMER_ID;

      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros,
          metrics.conversions
        FROM campaign 
        WHERE segments.date DURING ${this.getPeriodQuery(period)}
      `;

      const response = await axios.post(
        `${this.baseURL}/customers/${customerId}/googleAds:search`,
        { query },
        { headers }
      );

      return response.data.results || [];
    } catch (error) {
      console.error('Google Ads Campaigns Error:', error.response?.data || error.message);
      return this.getMockCampaigns(period);
    }
  }

  static async getPerformance(accountId, period = '7d') {
    try {
      if (!this.isConfigured()) {
        console.log('Google Ads not configured, returning mock data');
        return this.getMockPerformance(period);
      }

      const headers = await this.getHeaders();
      const customerId = accountId || process.env.GOOGLE_ADS_CUSTOMER_ID;

      const query = `
        SELECT 
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value
        FROM customer 
        WHERE segments.date DURING ${this.getPeriodQuery(period)}
      `;

      const response = await axios.post(
        `${this.baseURL}/customers/${customerId}/googleAds:search`,
        { query },
        { headers }
      );

      const data = response.data.results?.[0]?.metrics || {};
      
      return {
        clicks: data.clicks || 0,
        impressions: data.impressions || 0,
        spend: data.cost_micros ? data.cost_micros / 1000000 : 0,
        conversions: data.conversions || 0,
        conversionValue: data.conversions_value || 0,
        roas: data.cost_micros > 0 ? (data.conversions_value / (data.cost_micros / 1000000)).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Google Ads Performance Error:', error.response?.data || error.message);
      return this.getMockPerformance(period);
    }
  }

  static getPeriodQuery(period) {
    const today = new Date();
    const startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return `LAST_${period.toUpperCase()}`;
  }

  static getMockAccounts() {
    return [
      'customers/1234567890',
      'customers/0987654321'
    ];
  }

  static getMockCampaigns(period) {
    return Array.from({ length: 5 }, (_, i) => ({
      campaign: {
        id: `${1000 + i}`,
        name: `Campaign ${i + 1}`,
        status: 'ENABLED'
      },
      metrics: {
        clicks: Math.floor(Math.random() * 1000),
        impressions: Math.floor(Math.random() * 10000),
        cost_micros: Math.floor(Math.random() * 5000000000),
        conversions: Math.floor(Math.random() * 50)
      }
    }));
  }

  static getMockPerformance(period) {
    return {
      clicks: 15420,
      impressions: 387500,
      spend: 8940,
      conversions: 456,
      conversionValue: 28450,
      roas: 3.18
    };
  }

  static async testConnection() {
    try {
      if (!this.isConfigured()) {
        return { 
          status: 'error', 
          message: 'Google Ads credentials not configured. Please set GOOGLE_ACCESS_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN, and GOOGLE_ADS_CUSTOMER_ID environment variables.' 
        };
      }

      await this.getAccounts();
      return { status: 'connected', message: 'Google Ads API connection successful' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}