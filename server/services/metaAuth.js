import axios from 'axios';

export class MetaAuth {
  static getAuthUrl() {
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID,
      redirect_uri: process.env.META_REDIRECT_URI,
      scope: 'ads_management,ads_read,business_management',
      response_type: 'code',
      state: 'meta_auth_' + Date.now()
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  static async getTokens(code) {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code
        }
      });

      const { access_token } = response.data;
      
      // Store token securely
      process.env.META_ACCESS_TOKEN = access_token;
      
      return { access_token };
    } catch (error) {
      throw new Error(`Meta OAuth Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  static async getLongLivedToken(shortLivedToken) {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: shortLivedToken
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Meta Token Exchange Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  static async testConnection() {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          access_token: process.env.META_ACCESS_TOKEN,
          fields: 'id,name'
        }
      });

      return { status: 'connected', message: 'Meta API connection successful', user: response.data };
    } catch (error) {
      return { status: 'error', message: error.response?.data?.error?.message || error.message };
    }
  }
}