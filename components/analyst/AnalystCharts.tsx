"use client";

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface AnalystChartsProps {
  data: any[];
  type: 'bar' | 'line' | 'pie' | 'number';
}

const COLORS = ['#fb7185', '#a78bfa', '#34d399', '#facc15', '#60a5fa'];

export default function AnalystCharts({ data, type }: AnalystChartsProps) {
  if (!data || data.length === 0) return null;

  // Auto-detect keys for axes
  const keys = Object.keys(data[0] || {});
  const xAxisKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('name') || k.toLowerCase().includes('month')) || keys[0];
  const dataKey = keys.find(k => k !== xAxisKey && typeof data[0][k] === 'number') || keys[1];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 font-medium mb-1">{label}</p>
          <p className="text-coral-400 font-bold">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'pie') {
    const nameKey = keys.find(k => typeof data[0][k] === 'string') || keys[0];
    const valueKey = keys.find(k => typeof data[0][k] === 'number') || keys[1];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#666" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 2 }} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#fb7185" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#fb7185', strokeWidth: 0 }} 
            activeDot={{ r: 6, strokeWidth: 0 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'number') {
    const keys = Object.keys(data[0] || {});
    // Find absolute first key for label, and first number for value
    const labelKey = keys[0];
    const valueKey = keys.find(k => typeof data[0][k] === 'number') || keys[0];
    const value = data[0] ? data[0][valueKey] : 0;

    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-900/50 rounded-xl border border-gray-800">
         <span className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">{labelKey.replace(/_/g, ' ')}</span>
         <span className="text-4xl md:text-5xl font-black text-coral-500 tabular-nums tracking-tight">
           {typeof value === 'number' ? value.toLocaleString() : value}
         </span>
      </div>
    );
  }

  // Default to Bar (Table ignored here, handled by text response)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>

        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#666" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke="#666" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
        <Bar 
          dataKey={dataKey} 
          fill="#fb7185" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
