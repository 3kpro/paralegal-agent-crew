
import { useEffect, useState } from 'react';
import { api } from './api';
import type { Lane, SystemStatus, Trade } from './types';
import { LaneCard } from './components/LaneCard';
import { TradesList } from './components/TradesList';
import AnalyticsCharts from './components/AnalyticsCharts';
import { RefreshCw, Server, Zap, Download } from 'lucide-react';
import type { LaneAnalytics } from './types';

function App() {
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [analytics, setAnalytics] = useState<LaneAnalytics | null>(null);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [lanesData, tradesData, statusData] = await Promise.all([
        api.getLanes(),
        api.getRecentTrades(),
        api.getStatus()
      ]);
      setLanes(lanesData);
      setTrades(tradesData);
      setStatus(statusData);

      // Default to first lane for analytics if none selected
      const targetId = selectedLaneId || (lanesData.length > 0 ? lanesData[0].id : null);
      if (targetId) {
        const analyticsData = await api.getLaneAnalytics(targetId);
        setAnalytics(analyticsData);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading && !lanes.length) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Interface...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={32} color="#f59e0b" />
            SolForge AI
            <span style={{ fontSize: '0.8rem', background: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#94a3b8' }}>v0.1.0</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>Autonomous Trading Orchestrator</p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
           <div className="refresh-bar">
             <button
                className="btn"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', background: '#334155' }}
                onClick={() => window.location.href = 'http://localhost:8000/api/v1/export/csv'}
             >
               <Download size={14} /> CSV
             </button>
             <RefreshCw size={14} className="spin" /> 
             Live Update (5s)
           </div>
           {status && (
             <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                 <Server size={14} color={status.status === 'running' ? '#10b981' : '#ef4444'} />
                 {status.status.toUpperCase()}
               </span>
               <span>PnL: ${parseFloat(status.total_pnl).toFixed(2)}</span>
             </div>
           )}
        </div>
      </header>
      
      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        <div className="space-y-6">
          {analytics && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Performance Analytics
                <span className="text-secondary text-sm">Lane: {lanes.find(l => l.id === analytics.lane_id)?.name}</span>
              </h2>
              <AnalyticsCharts analytics={analytics} />
            </div>
          )}

          <div>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 500 }}>Active Trading Lanes</h2>
            <div className="grid">
              {lanes.map(lane => (
                <div key={lane.id} onClick={() => setSelectedLaneId(lane.id)} style={{ cursor: 'pointer' }}>
                  <LaneCard lane={lane} onUpdate={fetchData} />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
           <TradesList trades={trades} />
        </div>
      </main>
    </div>
  );
}

export default App;
