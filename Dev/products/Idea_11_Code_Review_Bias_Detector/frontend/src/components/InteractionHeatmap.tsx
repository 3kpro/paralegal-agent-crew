

interface InteractionHeatmapProps {
  matrix: Record<string, Record<string, number>>;
}

export default function InteractionHeatmap({ matrix }: InteractionHeatmapProps) {
  if (!matrix || Object.keys(matrix).length === 0) return null;

  const reviewers = Object.keys(matrix).sort();
  const authors = Array.from(new Set(Object.values(matrix).flatMap(obj => Object.keys(obj)))).sort();

  // Determine max value for opacity scaling
  let maxCount = 0;
  reviewers.forEach(r => {
      authors.forEach(a => {
          const val = matrix[r]?.[a] || 0;
          if (val > maxCount) maxCount = val;
      });
  });

  return (
    <div className="card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
      <h3>Interaction Matrix (Reviewer vs Author)</h3>
      <p style={{ opacity: 0.7, marginBottom: '1rem' }}>Values represent number of reviews.</p>
      
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px', fontSize: '0.9rem' }}>
        <thead>
            <tr>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Reviewer \ Author</th>
                {authors.map(author => (
                    <th key={author} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'normal', fontSize: '0.8rem' }}>
                        {author}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {reviewers.map(reviewer => (
                <tr key={reviewer}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{reviewer}</td>
                    {authors.map(author => {
                        const count = matrix[reviewer]?.[author] || 0;
                        const intensity = maxCount > 0 ? count / maxCount : 0;
                        const bgOpacity = 0.1 + (intensity * 0.9); // Min 0.1 opacity for non-zero, up to 1.0
                        
                        return (
                            <td key={`${reviewer}-${author}`} style={{ padding: '0.5rem', textAlign: 'center' }}>
                                {count > 0 ? (
                                    <div style={{
                                        background: `rgba(99, 102, 241, ${bgOpacity})`,
                                        color: intensity > 0.6 ? 'white' : 'black',
                                        padding: '0.25rem',
                                        borderRadius: '4px',
                                        width: '100%',
                                        height: '100%',
                                        minWidth: '30px'
                                    }}>
                                        {count}
                                    </div>
                                ) : (
                                    <span style={{ color: '#ccc' }}>-</span>
                                )}
                            </td>
                        );
                    })}
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
