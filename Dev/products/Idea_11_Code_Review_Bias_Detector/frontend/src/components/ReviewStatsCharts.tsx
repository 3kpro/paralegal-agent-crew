
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReviewStatsChartsProps {
  data: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ReviewStatsCharts({ data }: ReviewStatsChartsProps) {
  if (!data) return null;

  const topReviewers = data.top_reviewers || [];
  
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
      
      {/* Top Reviewers Bar Chart */}
      <div className="card" style={{ minHeight: '300px' }}>
        <h3>Top Reviewers by Volume</h3>
        <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer>
            <BarChart data={topReviewers} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="login" width={80} />
                <Tooltip />
                <Bar dataKey="reviews" fill="#8884d8" name="Reviews" />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Comment Categories Pie Chart */}
      <div className="card" style={{ minHeight: '300px' }}>
        <h3>Comment Categories</h3>
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
