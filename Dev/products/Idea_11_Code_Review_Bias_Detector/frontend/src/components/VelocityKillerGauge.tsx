import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface VelocityKillerGaugeProps {
  nitpickPercentage: number | null; // e.g. 15.5 for 15.5%
  loading?: boolean;
}

const VelocityKillerGauge = ({ nitpickPercentage, loading = false }: VelocityKillerGaugeProps) => {
  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p>Loading Gauge...</p>
      </div>
    );
  }

  if (nitpickPercentage === null || nitpickPercentage === undefined) {
    return null;
  }

  // Cap at 100 for visualization, though practically shouldn't happen often
  const value = Math.max(0, Math.min(100, nitpickPercentage));
  const remaining = 100 - value;

  // Color logic
  // Green: <10% (Healthy)
  // Yellow: 10-25% (Warning)
  // Red: >25% (Danger)
  let params = { color: '#4ade80', status: 'Healthy' }; // Green default
  if (value > 25) {
    params = { color: '#ef4444', status: 'Danger' }; // Red
  } else if (value >= 10) {
    params = { color: '#fbbf24', status: 'Warning' }; // Yellow
  }

  const data = [
    { name: 'Nitpicks', value: value },
    { name: 'Productive', value: remaining }
  ];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎯 Velocity Killer Gauge
        </h3>
        
        <div style={{ width: '100%', height: '250px', position: 'relative' }}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={5}
                    dataKey="value"
                >
                    <Cell fill={params.color} />
                    <Cell fill="#e5e7eb" /> {/* Gray for remaining */}
                    <Label
                        value={`${value.toFixed(1)}%`}
                        position="center"
                        fill={params.color}
                        style={{ fontSize: '2rem', fontWeight: 'bold' }}
                    />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', bottom: '20%', width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '1rem', color: params.color, fontWeight: 'bold' }}>
                NITPICK RATIO
            </span>
        </div>
        </div>

        {value > 25 && (
            <div style={{ 
                marginTop: '-2rem', 
                padding: '1rem', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.9rem'
            }}>
                ⚠️ <strong>Velocity Alert:</strong> Your team is wasting time on style arguments. <br/>Install a Linter immediately.
            </div>
        )}

        {value >= 10 && value <= 25 && (
            <div style={{ marginTop: '-2rem', fontSize: '0.9rem', color: '#fbbf24' }}>
                ⚠️ Warning: Style discussions are eating into clear coding time.
            </div>
        )}

        {value < 10 && (
            <div style={{ marginTop: '-2rem', fontSize: '0.9rem', color: '#4ade80' }}>
                ✅ Healthy! Discussions are focused on logic, not spaces.
            </div>
        )}
    </div>
  );
};

export default VelocityKillerGauge;
