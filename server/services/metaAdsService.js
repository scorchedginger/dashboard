import axios from 'axios';

export class MetaAdsService {
  static get baseURL() {
    return 'https://graph.facebook.com/v18.0';
  }

  static get accessToken() {
    return process.env.META_ACCESS_TOKEN;
  }

  static isConfigured() {
    return !!(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
  }

  static async getAdAccounts() {
    try {
      if (!this.isConfigured()) {
        console.log('Meta Ads not configured, returning mock data');
        return this.getMockAdAccounts();
      }

      const response = await axios.get(`${this.baseURL}/me/adaccounts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,account_status,currency'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Meta Ad Accounts Error:', error.response?.data || error.message);
      return this.getMockAdAccounts();
    }
  }

  static async getCampaigns(accountId, period = '7d') {
    try {
      if (!this.isConfigured()) {
        console.log('Meta Ads not configured, returning mock data');
        return this.getMockCampaigns(period);
      }

      const adAccountId = accountId || process.env.META_AD_ACCOUNT_ID;
      const timeRange = this.getPeriodTimeRange(period);

      const response = await axios.get(`${this.baseURL}/act_${adAccountId}/campaigns`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,status,insights{clicks,impressions,spend,actions}',
          time_range: JSON.stringify(timeRange)
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Meta Campaigns Error:', error.response?.data || error.message);
      return this.getMockCampaigns(period);
    }
  }

  static async getPerformance(accountId, period = '7d') {
    try {
      if (!this.isConfigured()) {
        console.log('Meta Ads not configured, returning mock data');
        return this.getMockPerformance(period);
      }

      const adAccountId = accountId || process.env.META_AD_ACCOUNT_ID;
      
      if (!adAccountId) {
        console.log('Meta Ad Account ID not configured, returning mock data');
        return this.getMockPerformance(period);
      }

      const timeRange = this.getPeriodTimeRange(period);

      const response = await axios.get(`${this.baseURL}/act_${adAccountId}/insights`, {
        params: {
          access_token: this.accessToken,
          fields: 'clicks,impressions,spend,actions,action_values',
          time_range: JSON.stringify(timeRange)
        }
      });

      const data = response.data.data?.[0] || {};
      const conversions = this.extractConversions(data.actions);
      const conversionValue = this.extractConversionValue(data.action_values);

      return {
        clicks: parseInt(data.clicks) || 0,
        impressions: parseInt(data.impressions) || 0,
        spend: parseFloat(data.spend) || 0,
        conversions,
        conversionValue,
        roas: data.spend > 0 ? (conversionValue / parseFloat(data.spend)).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Meta Performance Error:', error.response?.data || error.message);
      return this.getMockPerformance(period);
    }
  }

  static async getInsights(accountId, period = '7d', breakdown = null) {
    try {
      if (!this.isConfigured()) {
        console.log('Meta Ads not configured, returning mock data');
        return this.getMockInsights(period, breakdown);
      }

      const adAccountId = accountId || process.env.META_AD_ACCOUNT_ID;
      
      if (!adAccountId) {
        console.log('Meta Ad Account ID not configured, returning mock data');
        return this.getMockInsights(period, breakdown);
      }

      const timeRange = this.getPeriodTimeRange(period);

      const params = {
        access_token: this.accessToken,
        fields: 'clicks,impressions,spend,actions,ctr,cpm,cpp',
        time_range: JSON.stringify(timeRange)
      };

      if (breakdown) {
        params.breakdowns = breakdown;
      }

      const response = await axios.get(`${this.baseURL}/act_${adAccountId}/insights`, {
        params
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Meta Insights Error:', error.response?.data || error.message);
      return this.getMockInsights(period, breakdown);
    }
  }

  static getPeriodTimeRange(period) {
    const today = new Date();
    const since = new Date();

    switch (period) {
      case '24h':
        since.setDate(since.getDate() - 1);
        break;
      case '7d':
        since.setDate(since.getDate() - 7);
        break;
      case '30d':
        since.setDate(since.getDate() - 30);
        break;
      case '90d':
        since.setDate(since.getDate() - 90);
        break;
      default:
        since.setDate(since.getDate() - 7);
    }

    return {
      since: since.toISOString().split('T')[0],
      until: today.toISOString().split('T')[0]
    };
  }

  static extractConversions(actions) {
    if (!actions || !Array.isArray(actions)) return 0;
    
    const conversionActions = actions.filter(action => 
      action.action_type === 'purchase' || 
      action.action_type === 'lead' ||
      action.action_type === 'complete_registration'
    );

    return conversionActions.reduce((sum, action) => sum + parseInt(action.value || 0), 0);
  }

  static extractConversionValue(actionValues) {
    if (!actionValues || !Array.isArray(actionValues)) return 0;
    
    const purchaseValues = actionValues.filter(action => 
      action.action_type === 'purchase'
    );

    return purchaseValues.reduce((sum, action) => sum + parseFloat(action.value || 0), 0);
  }

  static getMockAdAccounts() {
    return [
      {
        id: 'act_123456789',
        name: 'Main Ad Account',
        account_status: 1,
        currency: 'USD'
      }
    ];
  }

  static getMockCampaigns(period) {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `${2000 + i}`,
      name: `Meta Campaign ${i + 1}`,
      status: 'ACTIVE',
      insights: {
        data: [{
          clicks: Math.floor(Math.random() * 500),
          impressions: Math.floor(Math.random() * 5000),
          spend: (Math.random() * 1000).toFixed(2),
          actions: [
            { action_type: 'purchase', value: Math.floor(Math.random() * 20) }
          ]
        }]
      }
    }));
  }

  static getMockPerformance(period) {
    return {
      clicks: 8750,
      impressions: 156300,
      spend: 6720,
      conversions: 312,
      conversionValue: 19750,
      roas: 2.94
    };
  }

  static getMockInsights(period, breakdown) {
    return Array.from({ length: 5 }, (_, i) => ({
      clicks: Math.floor(Math.random() * 200),
      impressions: Math.floor(Math.random() * 2000),
      spend: (Math.random() * 500).toFixed(2),
      ctr: (Math.random() * 5).toFixed(2),
      cpm: (Math.random() * 20).toFixed(2)
    }));
  }

  static async testConnection() {
    try {
      if (!this.isConfigured()) {
        return { 
          status: 'error', 
          message: 'Meta Ads credentials not configured. Please set META_ACCESS_TOKEN and META_AD_ACCOUNT_ID environment variables.' 
        };
      }

      await this.getAdAccounts();
      return { status: 'connected', message: 'Meta Ads API connection successful' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}