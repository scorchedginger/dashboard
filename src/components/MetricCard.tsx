import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
  color: string;
}

interface MetricCardProps {
  metric: Metric;
  index: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, index }) => {
  const { title, value, change, trend, icon: Icon, color } = metric;

  return (
    <div 
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{change}</span>
        </div>
      </div>
      
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
      
      <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: '75%' }}
        ></div>
      </div>
    </div>
  );
};

export default MetricCard;