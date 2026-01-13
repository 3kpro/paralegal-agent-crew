
import { useState, useEffect } from 'react';
import type { Lane, ReadinessScore } from '../types';
import { api } from '../api';
import { Play, Pause, Activity, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  lane: Lane;
  onUpdate: () => void;
}

export const LaneCard = ({ lane, onUpdate }: Props) => {
  const isRunning = lane.status === 'active';
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const data = await api.getReadiness(lane.id);
        setReadiness(data);
      } catch (err) {
        console.error('Failed to fetch readiness:', err);
      }
    };
    fetchReadiness();
  }, [lane.id]);
  
  const toggleStatus = async () => {
    if (isRunning) {
      await api.stopLane(lane.id);
    } else {
      await api.startLane(lane.id);
    }
    onUpdate();
  };

  const pnlColor = lane.total_pnl_pct >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{lane.name}</h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>
            {lane.profile} • AI {lane.ai_model_version}
          </span>
        </div>
        <span className={`badge badge-${lane.status}`}>
          {lane.status}
        </span>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="stat-row">
          <span className="label"><DollarSign size={14} style={{ display: 'inline', verticalAlign: '-2px' }}/> Capital</span>
          <span className="value">${parseFloat(lane.current_capital).toFixed(2)}</span>
        </div>
        <div className="stat-row">
          <span className="label"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: '-2px' }}/> Total PnL</span>
          <span className="value" style={{ color: pnlColor }}>
            {parseFloat(lane.total_pnl).toFixed(2)} ({lane.total_pnl_pct.toFixed(2)}%)
          </span>
        </div>
        <div className="stat-row">
          <span className="label"><Activity size={14} style={{ display: 'inline', verticalAlign: '-2px' }}/> Win Rate</span>
          <span className="value">
            {lane.win_count}/{lane.loss_count + lane.win_count}
            ({((lane.win_count / (lane.loss_count + lane.win_count || 1))*100).toFixed(0)}%)
          </span>
        </div>

        {readiness && (
          <div className="stat-row" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <span className="label">
              {readiness.is_ready ? (
                <CheckCircle size={14} style={{ display: 'inline', verticalAlign: '-2px', color: '#10b981' }}/>
              ) : (
                <AlertCircle size={14} style={{ display: 'inline', verticalAlign: '-2px', color: '#f59e0b' }}/>
              )}
              {' '}Live Ready
            </span>
            <span className="value" style={{ color: readiness.is_ready ? '#10b981' : '#f59e0b' }}>
              {readiness.overall_score.toFixed(0)}/100
              {readiness.is_ready && ' ✓'}
            </span>
          </div>
        )}
      </div>
      
      <button 
        className={`btn ${isRunning ? 'btn-stop' : 'btn-start'}`}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        onClick={toggleStatus}
      >
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
        {isRunning ? 'Pause Lane' : 'Start Lane'}
      </button>
    </div>
  );
};
