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
            <h1>Uncover Hidden Dynamics in Code Reviews</h1>
            <p className="hero-subtitle">
              Analyze patterns, detect bias, and improve engineering quality with data-driven insights. 
              FairMerge brings objectivity to your PR process.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={handleLogin}>
                Get Started
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
            Code reviews are the heartbeat of engineering culture. Don't let bias or inconsistency slow you down.
            Our AI-powered analysis detects bottlenecks and ensures fair, high-quality feedback for everyone.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Landing
