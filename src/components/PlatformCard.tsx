import React from 'react';

interface Platform {
  name: string;
  revenue?: string;
  orders?: number;
  conversionRate?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  spend?: string;
  conversions?: number;
  roas?: string;
  color: string;
  icon: React.ComponentType<any>;
}

interface PlatformCardProps {
  platform: Platform;
  index: number;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, index }) => {
  const { name, color, icon: Icon } = platform;

  const renderMetrics = () => {
    if (platform.revenue) {
      return (
        <>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Revenue</span>
            <span className="text-white font-semibold">{platform.revenue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Orders</span>
            <span className="text-white font-semibold">{platform.orders?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Conv. Rate</span>
            <span className="text-green-400 font-semibold">{platform.conversionRate}</span>
          </div>
        </>
      );
    }

    if (platform.impressions) {
      return (
        <>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Impressions</span>
            <span className="text-white font-semibold">{platform.impressions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Clicks</span>
            <span className="text-white font-semibold">{platform.clicks}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">CTR</span>
            <span className="text-blue-400 font-semibold">{platform.ctr}</span>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Spend</span>
          <span className="text-white font-semibold">{platform.spend}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Conversions</span>
          <span className="text-white font-semibold">{platform.conversions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">ROAS</span>
          <span className="text-yellow-400 font-semibold">{platform.roas}</span>
        </div>
      </>
    );
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group"
      style={{ animationDelay: `${(index + 6) * 100}ms` }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-white font-semibold text-lg">{name}</h3>
      </div>
      
      <div className="space-y-3">
        {renderMetrics()}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">Performance</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < 4 ? `bg-gradient-to-r ${color}` : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformCard;