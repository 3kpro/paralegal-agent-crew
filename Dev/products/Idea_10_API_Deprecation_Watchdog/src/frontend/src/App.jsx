import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', colors[severity.toLowerCase()] || colors.low)}>
      {severity.toUpperCase()}
    </span>
  );
};

const ChangeTypeIcon = ({ type }) => {
  switch (type.toLowerCase()) {
    case 'breaking': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'deprecation': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'feature': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'bugfix': return <CheckCircle className="w-4 h-4 text-blue-500" />;
    default: return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const TimelineItem = ({ change, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pl-8 pb-8 border-l border-border last:pb-0"
    >
      <div className="absolute left-[-9px] top-0 bg-background border border-border p-1 rounded-full">
        <ChangeTypeIcon type={change.change_type} />
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-mono">
            {format(new Date(change.published_at || change.detected_at), 'MMM d, yyyy')}
          </span>
          <SeverityBadge severity={change.severity} />
        </div>
        
        <h3 className="text-lg font-semibold tracking-tight text-foreground group">
          <a href={change.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            {change.title}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
           {change.description && change.description.length > 200 
             ? change.description.slice(0, 200) + '...' 
             : change.description || 'No details provided.'}
        </p>
      </div>
    </motion.div>
  );
};

function App() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const url = severityFilter === 'all' 
      ? `${API_BASE}/changes` 
      : `${API_BASE}/changes?severity=${severityFilter}`;
      
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setChanges(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch changes", err);
        setLoading(false);
      });
  }, [severityFilter]);

  return (
    <div className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">
            Breaking<span className="text-blue-500">Change</span> Watchdog
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor breaking changes and deprecations across your API dependencies.
          </p>
        </header>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                    severityFilter === sev 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="text-muted-foreground animate-pulse">Loading updates...</div>
            ) : changes.length > 0 ? (
              changes.map((change, i) => (
                <TimelineItem key={change.id} change={change} index={i} />
              ))
            ) : (
              <div className="text-muted-foreground">No changes detected yet. Add APIs in the backend.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
