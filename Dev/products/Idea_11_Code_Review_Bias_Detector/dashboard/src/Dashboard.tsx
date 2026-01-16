import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardStats {
  stats: {
    total_prs: number;
    avg_review_speed_hours: number;
  };
  matrix: {
    reviewer: string;
    author: string;
    count: number;
  }[];
  anomalies: {
    type: string;
    reviewer: string;
    author: string;
    deviation: string;
    severity: string; // 'medium' | 'high' | 'critical'
  }[];
  bias_risks: {
    type: string;
    reviewer: string;
    target: string;
    metric: string;
    severity: string;
  }[];
}

const API_BASE = 'http://localhost:8000';

export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [repo, setRepo] = useState('facebook/react'); // Default for demo

  useEffect(() => {
    fetchAnalysis();
  }, [repo]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      // In a real app, repo would be selected from a list of ingested repos
      const response = await axios.get(`${API_BASE}/repos/${repo}/analysis`);
      if (response.data.error) {
        console.error(response.data.error);
        setData(null);
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analysis', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Transform matrix for heatmap-like visualization (simplified as bar chart for MVP)
  const chartData = data?.matrix.slice(0, 10).map(m => ({
    name: `${m.reviewer} -> ${m.author}`,
    reviews: m.count
  })) || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-cyan-500/30">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ReviewLens
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400 border border-gray-700">Beta</span>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={repo} 
                onChange={(e) => setRepo(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
              >
                <option value="facebook/react">facebook/react</option>
                <option value="vercel/next.js">vercel/next.js</option>
                {/* Dynamically populate later */}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-400 text-sm">Total PRs</h3>
            </div>
            <p className="text-3xl font-bold text-white">{data?.stats.total_prs || 0}</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-medium text-gray-400 text-sm">Avg Review Time</h3>
            </div>
            <p className="text-3xl font-bold text-white">{data?.stats.avg_review_speed_hours || 0}<span className="text-sm font-normal text-gray-500 ml-1">hrs</span></p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                 <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-medium text-gray-400 text-sm">Speed Anomalies</h3>
            </div>
            <p className="text-3xl font-bold text-white">{data?.anomalies.length || 0}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-medium text-gray-400 text-sm">Bias Risks</h3>
            </div>
            <p className="text-3xl font-bold text-white">{data?.bias_risks?.length || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Review Interactions</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{fill: '#9CA3AF', fontSize: 12}} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem'}}
                    itemStyle={{color: '#E5E7EB'}}
                  />
                  <Bar dataKey="reviews" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Feed */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Detection</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {(!data || (data.anomalies.length === 0 && data.bias_risks.length === 0)) ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 pb-8">
                    <ShieldAlert className="w-12 h-12 mb-2 opacity-20" />
                    <p>No risks detected.</p>
                 </div>
              ) : (
                <>
                  {data?.bias_risks.map((risk, i) => (
                    <div key={`bias-${i}`} className={`p-4 rounded-lg border ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">{risk.type.replace('_', ' ')}</span>
                        <span className="text-xs font-mono">{risk.metric}</span>
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold">{risk.reviewer}</span> shows bias towards <span className="font-semibold">{risk.target}</span>.
                      </p>
                    </div>
                  ))}
                  {data?.anomalies.map((risk, i) => (
                    <div key={`anomaly-${i}`} className={`p-4 rounded-lg border ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">{risk.type.replace('_', ' ')}</span>
                        <span className="text-xs font-mono">{risk.deviation}</span>
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold">{risk.reviewer}</span> is slower to review <span className="font-semibold">{risk.author}</span>.
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
