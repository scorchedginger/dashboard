import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Settings, Building2 } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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
  meta: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    accessToken: string;
  };
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
}

interface BusinessSelectorProps {
  selectedBusinessId: string | null;
  onBusinessChange: (businessId: string) => void;
  onAddBusiness: () => void;
  onManageBusinesses: () => void;
}

const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  selectedBusinessId,
  onBusinessChange,
  onAddBusiness,
  onManageBusinesses
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusinessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === selectedBusinessId);
      setSelectedBusiness(business || businesses[0]);
    } else if (businesses.length > 0) {
      setSelectedBusiness(businesses[0]);
      onBusinessChange(businesses[0].id);
    }
  }, [selectedBusinessId, businesses]);

  const loadBusinesses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/businesses');
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
    onBusinessChange(business.id);
    setIsOpen(false);
  };

  const getConnectedPlatforms = (business: Business) => {
    const platforms = [];
    if (business.bigcommerce.enabled) platforms.push('BigCommerce');
    if (business.google.enabled) platforms.push('Google');
    if (business.meta.enabled) platforms.push('Meta');
    return platforms;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading businesses...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Building2 className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">
            {selectedBusiness?.name || 'Select Business'}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={onAddBusiness}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Add New Business"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          onClick={onManageBusinesses}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          title="Manage Businesses"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {businesses.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No businesses configured</p>
              <button
                onClick={onAddBusiness}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Add your first business
              </button>
            </div>
          ) : (
            <div className="py-2">
              {businesses.map((business) => {
                const connectedPlatforms = getConnectedPlatforms(business);
                const isSelected = selectedBusiness?.id === business.id;
                
                return (
                  <button
                    key={business.id}
                    onClick={() => handleBusinessSelect(business)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{business.name}</h3>
                        {business.description && (
                          <p className="text-sm text-gray-600 mt-1">{business.description}</p>
                        )}
                        {connectedPlatforms.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {connectedPlatforms.map((platform) => (
                              <span
                                key={platform}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessSelector; 