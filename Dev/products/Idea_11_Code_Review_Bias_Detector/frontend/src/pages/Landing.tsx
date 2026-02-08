import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Landing() {
  const [count, setCount] = useState(0)
  const { signInWithGithub, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = () => {
    signInWithGithub();
  };

  return (
    <div className="app-container">
      <header className="hero-section">
        <div className="container">
          <nav className="nav-bar">
            <div className="logo">FairMerge</div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <button 
                onClick={handleLogin}
                className="btn btn-primary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Login with GitHub
              </button>
            </div>
          </nav>
          
          <div className="hero-content">
            <h1>Stop Wasting 20 Hours a Week on Nitpicks</h1>
            <p className="hero-subtitle">
              FairMerge analyzes your team's PR review patterns to identify bottlenecks, eliminate time-wasting nitpicks,
              and help you ship 30% faster. Engineering velocity, optimized.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={handleLogin}>
                Get Free Health Check
              </button>
              <button className="btn" style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', marginLeft: '1rem' }} onClick={() => setCount((c) => c + 1)}>
                View Demo {count > 0 && `(${count})`}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{ marginTop: '4rem' }}>
        <div className="card">
          <h2>Why FairMerge?</h2>
          <p>
            Your senior engineers are drowning in code review backlogs. PRs sit for days. Teams argue about indentation.
            FairMerge's AI analyzes the last 90 days of reviews to show you exactly where velocity is bleeding: nitpick ratios,
            review load imbalance, and stale PR bottlenecks. One report. Immediate action.
          </p>
        </div>
      </main>

      <footer style={{
        marginTop: '4rem',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem'
      }}>
        <div className="container">
          <div style={{ marginBottom: '1rem' }}>
            <a href="/privacy" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', marginRight: '2rem' }}>
              Privacy Policy
            </a>
            <a href="/terms" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', marginRight: '2rem' }}>
              Terms of Service
            </a>
            <a href="mailto:support@3kpro.services" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              Support
            </a>
          </div>
          <p style={{ margin: 0, opacity: 0.7 }}>
            © 2026 3K Pro Services LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
