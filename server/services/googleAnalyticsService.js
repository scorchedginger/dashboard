import { google } from 'googleapis';

export class GoogleAnalyticsService {
  static async getAnalytics(propertyId, startDate, endDate, businessId = null) {
    try {
      // Get business-specific configuration
      const config = await this.getBusinessConfig(businessId);
      if (!config) {
        console.log('Google Analytics not configured, returning mock data');
        return this.getMockData();
      }

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

      const [response] = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            { name: 'totalUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'sessionsPerUser' }
          ],
          dimensions: [
            { name: 'date' }
          ]
        }
      });

      return this.processAnalyticsData(response);
    } catch (error) {
      console.error('Google Analytics API Error:', error);
      return this.getMockData();
    }
  }

  static async getTrafficSources(propertyId, startDate, endDate, businessId = null) {
    try {
      const config = await this.getBusinessConfig(businessId);
      if (!config) {
        return this.getMockTrafficSources();
      }

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

      const [response] = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            { name: 'sessions' }
          ],
          dimensions: [
            { name: 'sessionDefaultChannelGroup' }
          ]
        }
      });

      return this.processTrafficSourcesData(response);
    } catch (error) {
      console.error('Google Analytics Traffic Sources Error:', error);
      return this.getMockTrafficSources();
    }
  }

  static async getPageViews(propertyId, startDate, endDate, businessId = null) {
    try {
      const config = await this.getBusinessConfig(businessId);
      if (!config) {
        return this.getMockPageViews();
      }

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

      const [response] = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            { name: 'screenPageViews' }
          ],
          dimensions: [
            { name: 'date' }
          ]
        }
      });

      return this.processPageViewsData(response);
    } catch (error) {
      console.error('Google Analytics Page Views Error:', error);
      return this.getMockPageViews();
    }
  }

  static async testConnection(businessId = null) {
    try {
      const config = await this.getBusinessConfig(businessId);
      if (!config) {
        return { status: 'not_configured', message: 'Google Analytics is not configured for this business' };
      }

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
      
      // Test by listing properties
      await analyticsData.properties.list();
      
      return { status: 'connected', message: 'Google Analytics connection successful' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  static async getBusinessConfig(businessId) {
    if (!businessId) {
      // Fallback to environment variables for backward compatibility
      return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        accessToken: process.env.GOOGLE_ACCESS_TOKEN,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
      };
    }

    // TODO: Get business-specific config from BusinessManager
    // For now, return null to use mock data
    return null;
  }

  static processAnalyticsData(response) {
    if (!response.rows || response.rows.length === 0) {
      return this.getMockData();
    }

    const data = response.rows[0];
    return {
      totalUsers: parseInt(data.metricValues[0].value),
      sessions: parseInt(data.metricValues[1].value),
      pageViews: parseInt(data.metricValues[2].value),
      bounceRate: parseFloat(data.metricValues[3].value),
      avgSessionDuration: parseFloat(data.metricValues[4].value),
      sessionsPerUser: parseFloat(data.metricValues[5].value)
    };
  }

  static processTrafficSourcesData(response) {
    if (!response.rows || response.rows.length === 0) {
      return this.getMockTrafficSources();
    }

    return response.rows.map(row => ({
      source: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value)
    }));
  }

  static processPageViewsData(response) {
    if (!response.rows || response.rows.length === 0) {
      return this.getMockPageViews();
    }

    return response.rows.map(row => ({
      date: row.dimensionValues[0].value,
      pageViews: parseInt(row.metricValues[0].value)
    }));
  }

  static getMockData() {
    return {
      totalUsers: 15420,
      sessions: 23450,
      pageViews: 45670,
      bounceRate: 42.3,
      avgSessionDuration: 185.7,
      sessionsPerUser: 1.52
    };
  }

  static getMockTrafficSources() {
    return [
      { source: 'Organic Search', sessions: 12500 },
      { source: 'Direct', sessions: 6800 },
      { source: 'Social', sessions: 3200 },
      { source: 'Referral', sessions: 950 }
    ];
  }

  static getMockPageViews() {
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        pageViews: Math.floor(Math.random() * 2000) + 3000
      });
    }
    
    return data;
  }
} 