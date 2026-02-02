
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DeepAnalysisChartsProps {
  data: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DeepAnalysisCharts({ data }: DeepAnalysisChartsProps) {
  if (!data) return null;

  // Transform Comment Categories for Recharts
  const commentCategories = data.comment_stats?.categories || {};
  const categoryData = Object.keys(commentCategories).map(key => ({
    name: key,
    value: commentCategories[key]
  }));

  // Transform Comment Tones for Recharts
  const commentTones = data.comment_stats?.tones || {};
  const toneData = Object.keys(commentTones).map(key => ({
    name: key,
    value: commentTones[key]
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      
      {/* Comment Categories Pie Chart */}
      <div className="card" style={{ minHeight: '300px' }}>
        <h3>Comment Categories</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Are reviews focusing on substantial issues or just nitpicks?
        </p>
        {categoryData.length > 0 ? (
            <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <p style={{ opacity: 0.5 }}>No category data available.</p>
        )}
      </div>

      {/* Comment Tone Pie Chart */}
      <div className="card" style={{ minHeight: '300px' }}>
        <h3>Comment Tone</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Sentiment analysis of review comments. Positive/neutral is ideal.
        </p>
        {toneData.length > 0 ? (
            <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={toneData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#82ca9d"
                        dataKey="value"
                    >
                         {toneData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <p style={{ opacity: 0.5 }}>No tone data available.</p>
        )}
      </div>

    </div>
  );
}
