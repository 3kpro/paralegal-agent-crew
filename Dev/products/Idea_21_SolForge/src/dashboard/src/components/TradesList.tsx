
import type { Trade } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  trades: Trade[];
}

export const TradesList = ({ trades }: Props) => {
  if (!trades.length) {
    return <div className="card" style={{ textAlign: 'center', color: '#64748b' }}>No recent trades</div>;
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Activity</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {trades.map((trade) => (
          <div key={trade.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                background: trade.action === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: trade.action === 'BUY' ? '#10b981' : '#ef4444',
                padding: '0.5rem',
                borderRadius: '8px'
              }}>
                {trade.action === 'BUY' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>
                  {trade.action} {trade.token_symbol}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {new Date(trade.timestamp).toLocaleTimeString()} • ${trade.price.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontWeight: 500 }}>
                 {trade.amount.toFixed(4)}
               </div>
               {trade.pnl !== null && (
                 <div style={{ 
                   fontSize: '0.8rem', 
                   color: trade.pnl >= 0 ? '#10b981' : '#ef4444' 
                 }}>
                   {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} ({trade.pnl_pct?.toFixed(2)}%)
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
