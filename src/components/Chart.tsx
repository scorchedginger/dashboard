import React from 'react';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'pie';
  color: string;
}

const Chart: React.FC<ChartProps> = ({ title, data, type, color }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const renderLineChart = () => {
    return (
      <div className="h-64 flex items-end justify-between space-x-2 px-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex flex-col items-center space-y-2 flex-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
              <div
                className={`w-8 bg-gradient-to-t ${color} rounded-t-lg transition-all duration-1000 ease-out hover:scale-110`}
                style={{ 
                  height: `${(item.value / maxValue) * 180}px`,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={item.name}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out hover:stroke-width-10"
                  style={{
                    animationDelay: `${index * 200}ms`
                  }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <PieChartIcon className="h-8 w-8 text-white/60" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 w-full">
          {data.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-400">{item.name}</span>
              <span className="text-xs text-white font-semibold ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>{title}</span>
        </h3>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
      
      {type === 'line' ? renderLineChart() : renderPieChart()}
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Live Updates</span>
          <span className="text-green-400 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
};

export default Chart;