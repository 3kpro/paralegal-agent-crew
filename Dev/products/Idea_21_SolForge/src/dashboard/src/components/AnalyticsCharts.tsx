import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import type { LaneAnalytics } from '../types';

interface Props {
  analytics: LaneAnalytics;
}

const AnalyticsCharts: React.FC<Props> = ({ analytics }) => {
  const chartData = analytics.pnl_history.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pnl: point.pnl,
    value: point.total_value
  }));

  const isPositive = analytics.sharpe_ratio > 0;

  return (
    <div className="analytics-container space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-secondary text-xs uppercase tracking-wider">Sharpe Ratio</p>
            <p className={`text-xl font-bold ${isPositive ? 'text-primary' : 'text-red-400'}`}>
              {analytics.sharpe_ratio.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-500/20 text-red-400">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-secondary text-xs uppercase tracking-wider">Max Drawdown</p>
            <p className="text-xl font-bold text-red-400">
              {(analytics.max_drawdown * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
            <Target size={20} />
          </div>
          <div>
            <p className="text-secondary text-xs uppercase tracking-wider">Profit Factor</p>
            <p className="text-xl font-bold text-purple-400">
              {analytics.profit_factor.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6 h-[300px] w-full">
        <h3 className="text-sm font-semibold mb-4 flex items-center">
          <TrendingUp size={16} className="mr-2 text-primary" />
          PnL Growth History
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffa3" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00ffa3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#666" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#00ffa3' }}
            />
            <Area 
              type="monotone" 
              dataKey="pnl" 
              stroke="#00ffa3" 
              fillOpacity={1} 
              fill="url(#colorPnl)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
