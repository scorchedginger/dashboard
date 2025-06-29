import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Business } from '../models/Business.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BusinessManager {
  constructor() {
    this.storagePath = path.join(__dirname, '../data/businesses.json');
    this.businesses = new Map();
    this.loadBusinesses();
  }

  async loadBusinesses() {
    try {
      await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
      
      const data = await fs.readFile(this.storagePath, 'utf8');
      const businesses = JSON.parse(data);
      
      this.businesses.clear();
      businesses.forEach(businessData => {
        const business = new Business(businessData);
        this.businesses.set(business.id, business);
      });
      
      console.log(`Loaded ${this.businesses.size} businesses`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create default business
        await this.createDefaultBusiness();
      } else {
        console.error('Error loading businesses:', error);
      }
    }
  }

  async saveBusinesses() {
    try {
      const businessesArray = Array.from(this.businesses.values()).map(b => b.toJSON());
      await fs.writeFile(this.storagePath, JSON.stringify(businessesArray, null, 2));
    } catch (error) {
      console.error('Error saving businesses:', error);
      throw error;
    }
  }

  async createDefaultBusiness() {
    const defaultBusiness = new Business({
      name: 'My Business',
      description: 'Default business configuration',
      bigcommerce: { enabled: false },
      google: { enabled: false },
      meta: { enabled: false }
    });
    
    this.businesses.set(defaultBusiness.id, defaultBusiness);
    await this.saveBusinesses();
    console.log('Created default business');
  }

  async getAllBusinesses() {
    return Array.from(this.businesses.values()).map(b => b.toJSON());
  }

  async getBusiness(id) {
    const business = this.businesses.get(id);
    return business ? business.toJSON() : null;
  }

  async createBusiness(businessData) {
    const business = new Business(businessData);
    this.businesses.set(business.id, business);
    await this.saveBusinesses();
    return business.toJSON();
  }

  async updateBusiness(id, updates) {
    const business = this.businesses.get(id);
    if (!business) {
      throw new Error('Business not found');
    }

    // Update basic fields
    if (updates.name !== undefined) business.name = updates.name;
    if (updates.description !== undefined) business.description = updates.description;
    if (updates.settings !== undefined) business.settings = { ...business.settings, ...updates.settings };
    
    // Update API configurations
    if (updates.bigcommerce !== undefined) {
      business.updateApiConfig('bigcommerce', updates.bigcommerce);
    }
    if (updates.google !== undefined) {
      business.updateApiConfig('google', updates.google);
    }
    if (updates.meta !== undefined) {
      business.updateApiConfig('meta', updates.meta);
    }

    business.updatedAt = new Date().toISOString();
    await this.saveBusinesses();
    return business.toJSON();
  }

  async deleteBusiness(id) {
    if (this.businesses.size <= 1) {
      throw new Error('Cannot delete the last business');
    }
    
    const deleted = this.businesses.delete(id);
    if (deleted) {
      await this.saveBusinesses();
    }
    return deleted;
  }

  async getBusinessConfig(id, platform) {
    const business = this.businesses.get(id);
    if (!business) {
      throw new Error('Business not found');
    }

    switch (platform) {
      case 'bigcommerce':
        return business.getBigCommerceConfig();
      case 'google':
        return business.getGoogleConfig();
      case 'googleAnalytics':
        return business.getGoogleAnalyticsConfig();
      case 'meta':
        return business.getMetaConfig();
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  async testBusinessConnection(id, platform) {
    const config = await this.getBusinessConfig(id, platform);
    if (!config) {
      return { status: 'not_configured', message: `${platform} is not configured for this business` };
    }

    // Import and test the appropriate service
    try {
      switch (platform) {
        case 'bigcommerce':
          const { BigCommerceAuth } = await import('./bigcommerceAuth.js');
          return await BigCommerceAuth.testConnection(config);
        case 'google':
          const { GoogleAuth } = await import('./googleAuth.js');
          return await GoogleAuth.testConnection(config);
        case 'googleAnalytics':
          const { GoogleAnalyticsService } = await import('./googleAnalyticsService.js');
          return await GoogleAnalyticsService.testConnection(id);
        case 'meta':
          const { MetaAuth } = await import('./metaAuth.js');
          return await MetaAuth.testConnection(config);
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
} 