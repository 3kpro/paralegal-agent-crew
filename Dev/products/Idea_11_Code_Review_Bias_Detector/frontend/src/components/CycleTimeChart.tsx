import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CycleTimeChartProps {
  data: { date: string; avg_cycle_time_hours: number }[];
}

const CycleTimeChart: React.FC<CycleTimeChartProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No cycle time data available</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number | undefined) => [`${value ?? 0} hours`, 'Avg Cycle Time']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Area type="monotone" dataKey="avg_cycle_time_hours" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CycleTimeChart;
