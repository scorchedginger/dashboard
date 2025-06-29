const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard endpoints with business support
  static async getDashboardMetrics(period: string = '7d', businessId?: string) {
    const endpoint = businessId ? `/dashboard/${businessId}/metrics` : '/dashboard/metrics';
    return this.request(`${endpoint}?period=${period}`);
  }

  static async getPlatformData(period: string = '7d', businessId?: string) {
    const endpoint = businessId ? `/dashboard/${businessId}/platforms` : '/dashboard/platforms';
    return this.request(`${endpoint}?period=${period}`);
  }

  static async getChartData(period: string = '7d', businessId?: string, type?: string) {
    const endpoint = businessId ? `/dashboard/${businessId}/charts` : '/dashboard/charts';
    const typeParam = type ? `&type=${type}` : '';
    return this.request(`${endpoint}?period=${period}${typeParam}`);
  }

  static async refreshData(businessId?: string) {
    const endpoint = businessId ? `/dashboard/${businessId}/refresh` : '/dashboard/refresh';
    return this.request(endpoint, { method: 'POST' });
  }

  static async getSystemStatus(businessId?: string) {
    const endpoint = businessId ? `/dashboard/${businessId}/status` : '/dashboard/status';
    return this.request(endpoint);
  }

  // Business management endpoints
  static async getBusinesses() {
    return this.request('/businesses');
  }

  static async getBusiness(id: string) {
    return this.request(`/businesses/${id}`);
  }

  static async createBusiness(businessData: any) {
    return this.request('/businesses', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  static async updateBusiness(id: string, businessData: any) {
    return this.request(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(businessData),
    });
  }

  static async deleteBusiness(id: string) {
    return this.request(`/businesses/${id}`, {
      method: 'DELETE',
    });
  }

  static async testBusinessConnection(businessId: string, platform: string) {
    return this.request(`/businesses/${businessId}/test/${platform}`, {
      method: 'POST',
    });
  }

  // Google Analytics endpoints
  static async getGoogleAnalyticsOverview(params?: {
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    businessId?: string;
  }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/google-analytics/overview${queryParams}`);
  }

  static async getGoogleAnalyticsTrafficSources(params?: {
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    businessId?: string;
  }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/google-analytics/traffic-sources${queryParams}`);
  }

  static async getGoogleAnalyticsPageViews(params?: {
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    businessId?: string;
  }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/google-analytics/page-views${queryParams}`);
  }

  static async getGoogleAnalyticsProperties(businessId?: string) {
    const queryParams = businessId ? `?businessId=${businessId}` : '';
    return this.request(`/google-analytics/properties${queryParams}`);
  }

  static async testGoogleAnalyticsConnection(businessId?: string) {
    return this.request('/google-analytics/test', {
      method: 'POST',
      body: JSON.stringify({ businessId }),
    });
  }

  // Authentication endpoints
  static async getGoogleAuthUrl() {
    return this.request('/auth/google/url');
  }

  static async handleGoogleCallback(code: string) {
    return this.request('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  static async getMetaAuthUrl() {
    return this.request('/auth/meta/url');
  }

  static async handleMetaCallback(code: string) {
    return this.request('/auth/meta/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  static async testPlatformConnection(platform: string) {
    return this.request(`/auth/test/${platform}`);
  }

  // Platform-specific endpoints
  static async getBigCommerceData(endpoint: string, params?: Record<string, string>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/bigcommerce${endpoint}${queryParams}`);
  }

  static async getGoogleData(endpoint: string, params?: Record<string, string>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/google${endpoint}${queryParams}`);
  }

  static async getMetaData(endpoint: string, params?: Record<string, string>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/meta${endpoint}${queryParams}`);
  }

  // Health check
  static async getHealthStatus() {
    return this.request('/health');
  }
}