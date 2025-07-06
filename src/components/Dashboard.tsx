import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Search, 
  Target, 
  DollarSign,
  Users,
  Eye,
  MousePointer,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  LucideIcon,
  Settings
} from 'lucide-react';
import MetricCard from './MetricCard';
import Chart from './Chart';
import PlatformCard from './PlatformCard';
import BusinessSelector from './BusinessSelector';
import ApiConfigModal from './ApiConfigModal';
import { ApiService } from '../services/apiService';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

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
  icon: LucideIcon;
}

interface ChartData {
  revenue?: Array<{ name: string; value: number }>;
  traffic?: Array<{ name: string; value: number; color?: string }>;
  conversions?: Array<{ name: string; value: number }>;
}

interface SystemStatus {
  services?: Record<string, string>;
  cache?: { hitRate: number; size?: number };
  timestamp?: string;
  businessId?: string;
  refreshInProgress?: boolean;
}

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [chartData, setChartData] = useState<ChartData>({});
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);

  useEffect(() => {
    // Initialize with first business if none selected
    if (!selectedBusinessId) {
      initializeBusiness();
    } else {
      loadDashboardData();
      loadSystemStatus();
    }
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(() => {
      if (selectedBusinessId) {
        loadSystemStatus();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPeriod, selectedBusinessId]);

  const initializeBusiness = async () => {
    try {
      const businesses = await ApiService.getBusinesses() as any[];
      if (businesses && businesses.length > 0) {
        setSelectedBusinessId(businesses[0].id);
      }
    } catch (error) {
      console.error('Error initializing business:', error);
      setError('Failed to load business configuration');
    }
  };

  const loadDashboardData = async () => {
    if (!selectedBusinessId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const [metricsData, platformsData, chartsData] = await Promise.allSettled([
        ApiService.getDashboardMetrics(selectedPeriod, selectedBusinessId),
        ApiService.getPlatformData(selectedPeriod, selectedBusinessId),
        ApiService.getChartData(selectedPeriod, selectedBusinessId)
      ]);

      // Process metrics
      if (metricsData.status === 'fulfilled') {
        const metrics = metricsData.value as any;
        const metricsArray = [
          {
            title: 'Total Revenue',
            value: metrics?.totalRevenue?.value || '$0',
            change: metrics?.totalRevenue?.change || '+0%',
            trend: metrics?.totalRevenue?.trend || 'up',
            icon: DollarSign,
            color: 'from-green-400 to-emerald-600'
          },
          {
            title: 'Orders',
            value: metrics?.orders?.value || '0',
            change: metrics?.orders?.change || '+0%',
            trend: metrics?.orders?.trend || 'up',
            icon: ShoppingCart,
            color: 'from-blue-400 to-blue-600'
          },
          {
            title: 'Conversions',
            value: metrics?.conversions?.value || '0',
            change: metrics?.conversions?.change || '+0%',
            trend: metrics?.conversions?.trend || 'up',
            icon: Target,
            color: 'from-purple-400 to-purple-600'
          },
          {
            title: 'Click-through Rate',
            value: metrics?.clickThroughRate?.value || '0%',
            change: metrics?.clickThroughRate?.change || '+0%',
            trend: metrics?.clickThroughRate?.trend || 'up',
            icon: MousePointer,
            color: 'from-pink-400 to-pink-600'
          },
          {
            title: 'Impressions',
            value: metrics?.impressions?.value || '0',
            change: metrics?.impressions?.change || '+0%',
            trend: metrics?.impressions?.trend || 'up',
            icon: Eye,
            color: 'from-orange-400 to-red-500'
          },
          {
            title: 'Active Users',
            value: metrics?.activeUsers?.value || '0',
            change: metrics?.activeUsers?.change || '+0%',
            trend: metrics?.activeUsers?.trend || 'up',
            icon: Users,
            color: 'from-cyan-400 to-teal-600'
          }
        ];
        setMetrics(metricsArray);
      }

      // Process platforms
      if (platformsData.status === 'fulfilled') {
        const platformsWithIcons = (platformsData.value as any[]).map(platform => ({
          ...platform,
          icon: getPlatformIcon(platform.name)
        }));
        setPlatforms(platformsWithIcons);
      }

      // Process chart data
      if (chartsData.status === 'fulfilled') {
        setChartData(chartsData.value as any);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Using offline mode.');
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemStatus = async () => {
    if (!selectedBusinessId) return;
    
    try {
      const status = await ApiService.getSystemStatus(selectedBusinessId);
      setSystemStatus(status as SystemStatus);
    } catch (error) {
      console.error('Error loading system status:', error);
      setSystemStatus({ services: {}, cache: { hitRate: 0 } });
    }
  };

  const handleRefresh = async () => {
    if (!selectedBusinessId) return;
    
    try {
      setIsRefreshing(true);
      await ApiService.refreshData(selectedBusinessId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBusinessChange = (businessId: string) => {
    setSelectedBusinessId(businessId);
    // Clear current data when switching businesses
    setMetrics([]);
    setPlatforms([]);
    setChartData({});
    setSystemStatus(null);
  };

  const handleAddBusiness = () => {
    setShowBusinessModal(true);
  };

  const handleManageBusinesses = () => {
    // TODO: Implement business management modal
    console.log('Manage businesses clicked');
  };

  const getPlatformIcon = (platformName: string): LucideIcon => {
    switch (platformName.toLowerCase()) {
      case 'bigcommerce':
        return ShoppingCart;
      case 'google search console':
        return Search;
      case 'google ads':
        return Target;
      case 'meta ads':
        return Activity;
      default:
        return BarChart3;
    }
  };

  const loadFallbackData = () => {
    // Load mock data as fallback
    setMetrics([
      {
        title: 'Total Revenue',
        value: '$47,392',
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'from-green-400 to-emerald-600'
      },
      {
        title: 'Orders',
        value: '1,847',
        change: '+8.2%',
        trend: 'up',
        icon: ShoppingCart,
        color: 'from-blue-400 to-blue-600'
      },
      {
        title: 'Conversions',
        value: '924',
        change: '+15.7%',
        trend: 'up',
        icon: Target,
        color: 'from-purple-400 to-purple-600'
      },
      {
        title: 'Click-through Rate',
        value: '3.42%',
        change: '+2.1%',
        trend: 'up',
        icon: MousePointer,
        color: 'from-pink-400 to-pink-600'
      },
      {
        title: 'Impressions',
        value: '2.4M',
        change: '+18.9%',
        trend: 'up',
        icon: Eye,
        color: 'from-orange-400 to-red-500'
      },
      {
        title: 'Active Users',
        value: '12,847',
        change: '+5.3%',
        trend: 'up',
        icon: Users,
        color: 'from-cyan-400 to-teal-600'
      }
    ]);

    setPlatforms([
      {
        name: 'BigCommerce',
        revenue: '$28,450',
        orders: 1124,
        conversionRate: '4.2%',
        color: 'from-blue-500 to-blue-700',
        icon: ShoppingCart
      },
      {
        name: 'Google Search Console',
        impressions: '1.2M',
        clicks: '48.2K',
        ctr: '4.01%',
        color: 'from-green-500 to-green-700',
        icon: Search
      },
      {
        name: 'Google Ads',
        spend: '$8,940',
        conversions: 456,
        roas: '3.18x',
        color: 'from-yellow-500 to-orange-600',
        icon: Target
      },
      {
        name: 'Meta Ads',
        spend: '$6,720',
        conversions: 312,
        roas: '2.94x',
        color: 'from-pink-500 to-purple-600',
        icon: Activity
      }
    ]);

    setChartData({
      revenue: [
        { name: 'Mon', value: 6800 },
        { name: 'Tue', value: 7200 },
        { name: 'Wed', value: 6900 },
        { name: 'Thu', value: 8100 },
        { name: 'Fri', value: 7800 },
        { name: 'Sat', value: 9200 },
        { name: 'Sun', value: 8900 }
      ],
      traffic: [
        { name: 'Organic', value: 45, color: '#10B981' },
        { name: 'Paid Ads', value: 30, color: '#3B82F6' },
        { name: 'Social', value: 15, color: '#EC4899' },
        { name: 'Direct', value: 10, color: '#F59E0B' }
      ]
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.3s', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-white text-xl font-semibold">Loading your dashboard...</p>
          <p className="text-purple-300 mt-2">Syncing data from all platforms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Marketing Command Center
              </h1>
              
              {/* Business Selector */}
              <BusinessSelector
                selectedBusinessId={selectedBusinessId}
                onBusinessChange={handleBusinessChange}
                onAddBusiness={handleAddBusiness}
                onManageBusinesses={handleManageBusinesses}
              />
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {systemStatus ? (
                  <div className="flex items-center space-x-1">
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <WifiOff className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">Offline</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-md"
              >
                <option value="24h" className="bg-slate-800">Last 24 hours</option>
                <option value="7d" className="bg-slate-800">Last 7 days</option>
                <option value="30d" className="bg-slate-800">Last 30 days</option>
                <option value="90d" className="bg-slate-800">Last 90 days</option>
              </select>
              
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              <button 
                onClick={() => setShowApiConfigModal(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Configure APIs</span>
              </button>
              
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105">
                <Calendar className="h-4 w-4 inline mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-200">{error}</p>
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.title} metric={metric} index={index} />
          ))}
        </div>

        {/* Platform Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {platforms.map((platform, index) => (
            <PlatformCard key={platform.name} platform={platform} index={index} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Chart 
              title="Revenue Trend" 
              data={chartData.revenue || []} 
              type="line"
              color="from-green-400 to-emerald-600"
            />
          </div>
          
          {/* Traffic Sources */}
          <div>
            <Chart 
              title="Traffic Sources" 
              data={chartData.traffic || []} 
              type="pie"
              color="from-purple-400 to-pink-600"
            />
          </div>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div className="mt-8 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(systemStatus.services || {}).map(([service, status]) => (
                <div key={service} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-gray-300 text-sm capitalize">{service}</span>
                </div>
              ))}
            </div>
            {systemStatus.cache && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Cache Hit Rate: <span className="text-white font-medium">{systemStatus.cache.hitRate}%</span>
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* API Configuration Modal */}
      <ApiConfigModal
        isOpen={showApiConfigModal}
        onClose={() => setShowApiConfigModal(false)}
        businessId={selectedBusinessId || undefined}
        onSave={() => {
          loadDashboardData();
          loadSystemStatus();
        }}
      />
    </div>
  );
};

export default Dashboard;