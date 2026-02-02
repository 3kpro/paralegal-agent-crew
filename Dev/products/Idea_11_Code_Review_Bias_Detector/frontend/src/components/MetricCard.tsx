import React from 'react';
import InfoTooltip from './InfoTooltip';
import Sparkline from './Sparkline';
import CountUp from 'react-countup';

interface MetricCardProps {
  title: string;
  value: string | number;
  tooltipText: string;
  trendData?: number[];
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: string; // Color for sparkline and accents
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  tooltipText, 
  trendData, 
  trendLabel,
  trendDirection = 'neutral',
  color = '#4F46E5'
}) => {
  const getTrendColor = () => {
    if (trendDirection === 'up') return '#10B981'; // Green
    if (trendDirection === 'down') return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const parseNumber = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return { num: 0, suffix: '' };
    if (typeof val === 'number') return { num: val, suffix: '' };
    const match = val.match(/^(\d+)(.*)$/);
    if (match) return { num: parseFloat(match[1]), suffix: match[2] };
    return { num: 0, suffix: String(val) }; // Fallback
  };

  const { num, suffix } = parseNumber(value);

  return (
    <div className="metric-card" style={{
      backgroundColor: 'var(--card-bg, #fff)',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid var(--border-color, #e5e7eb)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          fontWeight: 500, 
          color: 'var(--text-secondary, #6B7280)',
          display: 'flex',
          alignItems: 'center'
        }}>
          {title}
          <InfoTooltip text={tooltipText} />
        </h3>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div>
          <div style={{ fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-color, #111)', lineHeight: 1 }}>
            <CountUp end={num} duration={2} separator="," suffix={suffix} />
          </div>
          {trendLabel && (
            <div style={{ 
              fontSize: '0.75rem', 
              marginTop: '0.25rem',
              color: getTrendColor(),
              fontWeight: 500
            }}>
              {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '•'} {trendLabel}
            </div>
          )}
        </div>
        
        {trendData && trendData.length > 0 && (
          <Sparkline data={trendData} color={color} width={80} height={40} />
        )}
      </div>
    </div>
  );
};

export default MetricCard;
