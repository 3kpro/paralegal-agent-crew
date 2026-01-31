"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ActivityChartProps {
  data?: Array<{
    date: string;
    campaigns: number;
    content: number;
  }>;
}

// Generate sample data for the last 7 days
function generateSampleData() {
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      campaigns: Math.floor(Math.random() * 5),
      content: Math.floor(Math.random() * 15),
    });
  }

  return data;
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const chartData = data || generateSampleData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="p-6 bg-[#343a40] backdrop-blur-xl border-2 border-gray-700/50 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-coral-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-coral-500" />
            </div>
            Activity This Week
          </h2>
          <p className="text-sm text-gray-200 mt-1">
            Your content creation journey
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCampaigns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorContent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
          />
          <Area
            type="monotone"
            dataKey="campaigns"
            stroke="#F97316"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCampaigns)"
            name="Campaigns"
          />
          <Area
            type="monotone"
            dataKey="content"
            stroke="#8B5CF6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorContent)"
            name="Content Pieces"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-coral-500" />
          <span className="text-sm text-gray-300">Campaigns</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-sm text-gray-300">Content Pieces</span>
        </div>
      </div>
    </motion.div>
  );
}
