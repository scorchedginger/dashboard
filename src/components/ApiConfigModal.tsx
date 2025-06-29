import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Eye, EyeOff, TestTube } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  onSave: () => void;
}

interface Business {
  id: string;
  name: string;
  bigcommerce: {
    enabled: boolean;
    storeHash: string;
    accessToken: string;
  };
  google: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
  };
  googleAnalytics: {
    enabled: boolean;
    propertyId: string;
  };
  meta: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    accessToken: string;
  };
}

const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  businessId,
  onSave
}) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && businessId) {
      loadBusiness();
    }
  }, [isOpen, businessId]);

  const loadBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`);
      if (response.ok) {
        const data = await response.json();
        setBusiness(data);
      }
    } catch (error) {
      console.error('Error loading business:', error);
    }
  };

  const handleSave = async () => {
    if (!business) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
      });
      
      if (response.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving business:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (platform: string) => {
    if (!businessId) return;
    
    setTestResults(prev => ({ ...prev, [platform]: { status: 'testing' } }));
    
    try {
      const response = await fetch(`/api/businesses/${businessId}/test/${platform}`, {
        method: 'POST'
      });
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [platform]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [platform]: { status: 'error', message: 'Connection failed' } 
      }));
    }
  };

  const toggleSecret = (platform: string, field: string) => {
    const key = `${platform}_${field}`;
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateConfig = (platform: string, field: string, value: any) => {
    if (!business) return;
    
    setBusiness(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev };
      if (platform === 'bigcommerce') {
        updated.bigcommerce = { ...updated.bigcommerce, [field]: value };
      } else if (platform === 'google') {
        updated.google = { ...updated.google, [field]: value };
      } else if (platform === 'googleAnalytics') {
        updated.googleAnalytics = { ...updated.googleAnalytics, [field]: value };
      } else if (platform === 'meta') {
        updated.meta = { ...updated.meta, [field]: value };
      }
      
      return updated;
    });
  };

  const getTestStatus = (platform: string) => {
    const result = testResults[platform];
    if (!result) return null;
    
    if (result.status === 'testing') {
      return { icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>, color: 'text-blue-600' };
    } else if (result.status === 'connected') {
      return { icon: <Check className="h-4 w-4" />, color: 'text-green-600' };
    } else if (result.status === 'not_configured') {
      return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-yellow-600' };
    } else {
      return { icon: <X className="h-4 w-4" />, color: 'text-red-600' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">API Configuration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Configure your API integrations for {business?.name}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* BigCommerce Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">BigCommerce</h3>
              <div className="flex items-center space-x-2">
                {getTestStatus('bigcommerce') && (
                  <span className={getTestStatus('bigcommerce')?.color}>
                    {getTestStatus('bigcommerce')?.icon}
                  </span>
                )}
                <button
                  onClick={() => testConnection('bigcommerce')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <TestTube className="h-3 w-3" />
                  <span>Test</span>
                </button>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={business?.bigcommerce.enabled || false}
                    onChange={(e) => updateConfig('bigcommerce', 'enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Hash
                </label>
                <input
                  type="text"
                  value={business?.bigcommerce.storeHash || ''}
                  onChange={(e) => updateConfig('bigcommerce', 'storeHash', e.target.value)}
                  placeholder="abc123def"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.bigcommerce_accessToken ? 'text' : 'password'}
                    value={business?.bigcommerce.accessToken || ''}
                    onChange={(e) => updateConfig('bigcommerce', 'accessToken', e.target.value)}
                    placeholder="Enter your access token"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('bigcommerce', 'accessToken')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.bigcommerce_accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Google Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Google (Ads & Search Console)</h3>
              <div className="flex items-center space-x-2">
                {getTestStatus('google') && (
                  <span className={getTestStatus('google')?.color}>
                    {getTestStatus('google')?.icon}
                  </span>
                )}
                <button
                  onClick={() => testConnection('google')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <TestTube className="h-3 w-3" />
                  <span>Test</span>
                </button>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={business?.google.enabled || false}
                    onChange={(e) => updateConfig('google', 'enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={business?.google.clientId || ''}
                  onChange={(e) => updateConfig('google', 'clientId', e.target.value)}
                  placeholder="123456789-abc123.apps.googleusercontent.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.google_clientSecret ? 'text' : 'password'}
                    value={business?.google.clientSecret || ''}
                    onChange={(e) => updateConfig('google', 'clientSecret', e.target.value)}
                    placeholder="Enter your client secret"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('google', 'clientSecret')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.google_clientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Google Analytics Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Google Analytics</h3>
              <div className="flex items-center space-x-2">
                {getTestStatus('googleAnalytics') && (
                  <span className={getTestStatus('googleAnalytics')?.color}>
                    {getTestStatus('googleAnalytics')?.icon}
                  </span>
                )}
                <button
                  onClick={() => testConnection('googleAnalytics')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <TestTube className="h-3 w-3" />
                  <span>Test</span>
                </button>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={business?.googleAnalytics.enabled || false}
                    onChange={(e) => updateConfig('googleAnalytics', 'enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property ID
              </label>
              <input
                type="text"
                value={business?.googleAnalytics.propertyId || ''}
                onChange={(e) => updateConfig('googleAnalytics', 'propertyId', e.target.value)}
                placeholder="123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Found in Google Analytics Admin → Property Settings
              </p>
            </div>
          </div>

          {/* Meta Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Meta/Facebook Ads</h3>
              <div className="flex items-center space-x-2">
                {getTestStatus('meta') && (
                  <span className={getTestStatus('meta')?.color}>
                    {getTestStatus('meta')?.icon}
                  </span>
                )}
                <button
                  onClick={() => testConnection('meta')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <TestTube className="h-3 w-3" />
                  <span>Test</span>
                </button>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={business?.meta.enabled || false}
                    onChange={(e) => updateConfig('meta', 'enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={business?.meta.appId || ''}
                  onChange={(e) => updateConfig('meta', 'appId', e.target.value)}
                  placeholder="123456789012345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.meta_appSecret ? 'text' : 'password'}
                    value={business?.meta.appSecret || ''}
                    onChange={(e) => updateConfig('meta', 'appSecret', e.target.value)}
                    placeholder="Enter your app secret"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('meta', 'appSecret')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.meta_appSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal; 