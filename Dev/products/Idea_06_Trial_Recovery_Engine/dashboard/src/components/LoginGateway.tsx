import { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export const LoginGateway = ({ onLogin }: LoginProps) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple MVP Auth: Hardcoded demo key or "admin"
    if (key === 'admin' || key === '3kpro_demo') {
      localStorage.setItem('trial_revive_auth', 'true');
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">▲</span>
          <h1>TrialRevive</h1>
        </div>
        <p>Enter your access key to manage recovery campaigns.</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            placeholder="Access Key" 
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError(false);
            }}
          />
          {error && <span className="error-msg">Invalid access key</span>}
          <button type="submit">Enter Dashboard</button>
        </form>
      </div>
    </div>
  );
};
