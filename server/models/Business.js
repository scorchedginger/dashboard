export class Business {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // API configurations
    this.bigcommerce = {
      storeHash: data.bigcommerce?.storeHash || '',
      accessToken: data.bigcommerce?.accessToken || '',
      enabled: data.bigcommerce?.enabled || false
    };
    
    this.google = {
      clientId: data.google?.clientId || '',
      clientSecret: data.google?.clientSecret || '',
      accessToken: data.google?.accessToken || '',
      refreshToken: data.google?.refreshToken || '',
      enabled: data.google?.enabled || false
    };

    this.googleAnalytics = {
      propertyId: data.googleAnalytics?.propertyId || '',
      enabled: data.googleAnalytics?.enabled || false
    };
    
    this.meta = {
      appId: data.meta?.appId || '',
      appSecret: data.meta?.appSecret || '',
      accessToken: data.meta?.accessToken || '',
      enabled: data.meta?.enabled || false
    };
    
    // Business settings
    this.settings = {
      timezone: data.settings?.timezone || 'UTC',
      currency: data.settings?.currency || 'USD',
      dateFormat: data.settings?.dateFormat || 'MM/DD/YYYY'
    };
  }

  generateId() {
    return 'biz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      bigcommerce: this.bigcommerce,
      google: this.google,
      googleAnalytics: this.googleAnalytics,
      meta: this.meta,
      settings: this.settings
    };
  }

  // Helper methods for API access
  getBigCommerceConfig() {
    return this.bigcommerce.enabled ? {
      storeHash: this.bigcommerce.storeHash,
      accessToken: this.bigcommerce.accessToken
    } : null;
  }

  getGoogleConfig() {
    return this.google.enabled ? {
      clientId: this.google.clientId,
      clientSecret: this.google.clientSecret,
      accessToken: this.google.accessToken,
      refreshToken: this.google.refreshToken
    } : null;
  }

  getGoogleAnalyticsConfig() {
    return this.googleAnalytics.enabled ? {
      propertyId: this.googleAnalytics.propertyId,
      // Use Google OAuth config for Analytics
      clientId: this.google.clientId,
      clientSecret: this.google.clientSecret,
      accessToken: this.google.accessToken,
      refreshToken: this.google.refreshToken
    } : null;
  }

  getMetaConfig() {
    return this.meta.enabled ? {
      appId: this.meta.appId,
      appSecret: this.meta.appSecret,
      accessToken: this.meta.accessToken
    } : null;
  }

  updateApiConfig(platform, config) {
    this.updatedAt = new Date().toISOString();
    
    switch (platform) {
      case 'bigcommerce':
        this.bigcommerce = { ...this.bigcommerce, ...config };
        break;
      case 'google':
        this.google = { ...this.google, ...config };
        break;
      case 'googleAnalytics':
        this.googleAnalytics = { ...this.googleAnalytics, ...config };
        break;
      case 'meta':
        this.meta = { ...this.meta, ...config };
        break;
    }
  }
} 