import { useState, useEffect } from 'react';
import './App.css';
import { PlaybookEditor } from './components/PlaybookEditor';
import { LoginGateway } from './components/LoginGateway';

interface TrialClassification {
  id: string;
  userEmail: string;
  category: 'confused' | 'wrong_fit' | 'more_time' | 'competitor' | 'ghosted' | 'price';
  confidence: number;
  reasoning: string;
  lastActive: string;
}

const mockClassifications: TrialClassification[] = [
  {
    id: '1',
    userEmail: 'alex@startup.io',
    category: 'price',
    confidence: 0.95,
    reasoning: 'Visited pricing page 4 times in the last 24 hours. Usage remains high but conversion link not clicked.',
    lastActive: '2 mins ago',
  },
  {
    id: '2',
    userEmail: 'sarah@enterprise.com',
    category: 'confused',
    confidence: 0.82,
    reasoning: 'Abandoned onboarding at step 3 (API Key Setup). Multiple clicks on "Help" docs in that section.',
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    userEmail: 'mike@devtools.co',
    category: 'more_time',
    confidence: 0.88,
    reasoning: 'Consistent active usage until trial day 13. High engagement with core features, then silence.',
    lastActive: '1 day ago',
  },
  {
    id: '4',
    userEmail: 'dev@ghost.sh',
    category: 'ghosted',
    confidence: 0.99,
    reasoning: 'Zero events recorded after initial signup. No login recorded since start.',
    lastActive: '5 days ago',
  }
];

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    price: '#00f2fe',
    confused: '#ff0080',
    more_time: '#7928ca',
    ghosted: '#4a5568',
    competitor: '#f59e0b',
    wrong_fit: '#ef4444'
  };

  return (
    <span className="badge" style={{ borderColor: colors[category], color: colors[category] }}>
      {category.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const ROIDashboard = () => {
  const metrics = {
    totalRecovered: '$12,450',
    recoveryRate: '18.4%',
    activeTests: 3,
    topPlaybook: '10% Discount'
  };

  const playbooks = [
    { name: '10% Discount', recoveries: 45, value: '$4,500', rate: '22%' },
    { name: '7-Day Extension', recoveries: 32, value: '$3,200', rate: '15%' },
    { name: 'Founders Office Hours', recoveries: 12, value: '$4,750', rate: '9%' },
  ];

  return (
    <section className="roi-section">
      <h2>ROI & Attribution</h2>
      <div className="roi-grid">
        <div className="roi-stats">
          <div className="stat-card">
            <span className="sc-label">Total Recovered</span>
            <span className="sc-value">{metrics.totalRecovered}</span>
            <div className="mini-chart"><div className="mc-fill" style={{width: '65%'}}></div></div>
          </div>
          <div className="stat-card">
            <span className="sc-label">Recovery Rate</span>
            <span className="sc-value text-accent">{metrics.recoveryRate}</span>
            <span className="sc-trend positive">+2.4% vs last month</span>
          </div>
          <div className="stat-card">
            <span className="sc-label">Top Performer</span>
            <span className="sc-value">{metrics.topPlaybook}</span>
            <span className="sc-trend">Attributed to 42% of revenue</span>
          </div>
        </div>

        <div className="attribution-list">
          <h3>Playbook Performance</h3>
          <div className="list-container">
            {playbooks.map((pb, idx) => (
              <div key={idx} className="list-item">
                <div className="li-info">
                  <span className="li-name">{pb.name}</span>
                  <span className="li-meta">{pb.recoveries} conversions • {pb.rate} rate</span>
                </div>
                <div className="li-value">{pb.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function App() {
  const [trials] = useState<TrialClassification[]>(mockClassifications);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('trial_revive_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginGateway onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <span className="logo-icon">▲</span>
          <h1>TrialRevive</h1>
        </div>
        <div className="stats-row">
          <div className="stat">
            <span className="stat-value">94%</span>
            <span className="stat-label">Prediction Accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-value">22</span>
            <span className="stat-label">Recoveries This Week</span>
          </div>
          <button 
             className="action-btn" 
             style={{background: 'rgba(255,255,255,0.1)', color: '#fff'}}
             onClick={() => {
               localStorage.removeItem('trial_revive_auth');
               setIsAuthenticated(false);
             }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <ROIDashboard />
        
        <PlaybookEditor />

        <section className="insight-section">
          <h2>Abandoned Trials — Requires Action</h2>
          <div className="trial-grid">
            {trials.map(trial => (
              <div key={trial.id} className="trial-card">
                <div className="card-header">
                  <span className="email">{trial.userEmail}</span>
                  <CategoryBadge category={trial.category} />
                </div>
                
                <div className="card-body">
                  <p className="reasoning">"{trial.reasoning}"</p>
                  <div className="confidence-bar">
                    <div className="confidence-label">
                      <span>AI Confidence</span>
                      <span>{(trial.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${trial.confidence * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="last-active">Last Active: {trial.lastActive}</span>
                  <button className="action-btn">Generate Playbook</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
