import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReviewVelocityChartProps {
  data: { date: string; review_count: number }[];
}

const ReviewVelocityChart: React.FC<ReviewVelocityChartProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No velocity data available</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
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
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Bar dataKey="review_count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Reviews" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewVelocityChart;
