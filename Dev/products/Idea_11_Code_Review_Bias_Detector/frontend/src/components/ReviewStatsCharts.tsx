// This file is being split. See `DeepAnalysisCharts.tsx` for the new component.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReviewStatsChartsProps {
  data: any;
}

export default function ReviewStatsCharts({ data }: ReviewStatsChartsProps) {
  if (!data) return null;

  const topReviewers = data.top_reviewers || [];

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Top Reviewers Bar Chart */}
      <div className="card" style={{ minHeight: '300px' }}>
        <h3>Top Reviewers by Volume</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Who is carrying the code review load? High volume is good, but check for burnout.
        </p>
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
    </div>
  );
}
