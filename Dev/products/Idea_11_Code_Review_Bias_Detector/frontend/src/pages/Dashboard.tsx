import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReviewStatsCharts from "../components/ReviewStatsCharts";
import InteractionHeatmap from "../components/InteractionHeatmap";
import VelocityKillerGauge from "../components/VelocityKillerGauge";
import MetricCard from "../components/MetricCard";
import AIInsightPanel from "../components/AIInsightPanel";
import AskAIButton from "../components/AskAIButton";
import AIExplanationModal from "../components/AIExplanationModal";
import CycleTimeChart from "../components/CycleTimeChart";
import ReviewVelocityChart from "../components/ReviewVelocityChart";

// Smart API_URL resolution: Use env var if present, otherwise fallback based on hostname
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8000' 
    : 'https://striking-liberation-production.up.railway.app');

console.log("Current API_URL:", API_URL); // Debug log (keep for verification)

function Dashboard() {
  const navigate = useNavigate();
  const { user, session, profile, loading: authLoading, signOut } = useAuth();
  
  // Lazy init: Try to get token from URL first, then localStorage
  const [token, setToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlPlatform = params.get('platform');
    
    if (urlToken && urlPlatform) {
        return urlToken;
    }
    
    const activePlat = localStorage.getItem('active_platform') || 'github';
    return localStorage.getItem(`${activePlat}_token`);
  });

  const [platform, setPlatform] = useState<'github' | 'gitlab'>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPlatform = params.get('platform');
    if (urlPlatform === 'github' || urlPlatform === 'gitlab') {
        return urlPlatform;
    }
    return (localStorage.getItem('active_platform') || 'github') as 'github' | 'gitlab';
  });
  
  const [repoName, setRepoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [trendsResult, setTrendsResult] = useState<any>(null);
  const [healthCheckResult, setHealthCheckResult] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [cycleTimeData, setCycleTimeData] = useState<any[]>([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);

  // Effect to persist URL params to localStorage and clear URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlPlatform = params.get('platform') as 'github' | 'gitlab';
    
    if (urlToken && urlPlatform) {
        console.log("Persisting token from URL to localStorage...");
        localStorage.setItem(`${urlPlatform}_token`, urlToken);
        localStorage.setItem('active_platform', urlPlatform);
        
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // Run once on mount

  // Auth redirect check
  useEffect(() => {
    if (!authLoading && !user) {
        navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('github_token');
    localStorage.removeItem('gitlab_token');
    localStorage.removeItem('active_platform');
    setToken(null);
    navigate('/');
  };

  const fetchHealthCheck = async (repo: string) => {
      try {
          const response = await fetch(`${API_URL}/reports/health-check/${encodeURIComponent(repo)}`, {
              headers: { 
                'Authorization': `Bearer ${session?.access_token}`,
              }
          });

          if (response.ok) {
              const data = await response.json();
              setHealthCheckResult(data);
          } else {
              setHealthCheckResult(null);
          }
      } catch (e) {
          console.error("Failed to fetch health check", e);
          setHealthCheckResult(null); 
      }
  };

  const fetchInsights = async (repo: string) => {
    setLoadingInsights(true);
    try {
        const response = await fetch(`${API_URL}/analysis/insights/${encodeURIComponent(repo)}`, {
          headers: { 
            'Authorization': `Bearer ${session?.access_token}`,
            'X-GitHub-Token': platform === 'github' ? token || '' : '',
            'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
          }
        });
        
        if (response.ok) {
            const data = await response.json();
            setInsights(Array.isArray(data.data) ? data.data : []);
        }
    } catch (e) {
        console.error("Failed to fetch insights", e);
    } finally {
        setLoadingInsights(false);
    }
  };

  const handleAskAI = async (question: string) => {
    const response = await fetch(`${API_URL}/analysis/insights/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'X-GitHub-Token': platform === 'github' ? token || '' : '',
            'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
        },
        body: JSON.stringify({ repo_name: repoName, question })
    });
    
    if (!response.ok) {
        throw new Error("Failed to get answer");
    }
    
    const data = await response.json();
    return data.data;
  };

  const fetchMetrics = async (repo: string) => {
      try {
          const authHeaders = { 
            'Authorization': `Bearer ${session?.access_token}`,
            'X-GitHub-Token': platform === 'github' ? token || '' : '',
            'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
          };

          // Fetch Cycle Time
          fetch(`${API_URL}/analysis/metrics/cycle-time/${encodeURIComponent(repo)}`, { headers: authHeaders })
            .then(res => res.json())
            .then(data => setCycleTimeData(data.data))
            .catch(e => console.error("Cycle time fetch error", e));

          // Fetch Velocity
          fetch(`${API_URL}/analysis/metrics/velocity/${encodeURIComponent(repo)}`, { headers: authHeaders })
            .then(res => res.json())
            .then(data => setVelocityData(data.data))
            .catch(e => console.error("Velocity fetch error", e));

      } catch (e) {
          console.error("Failed to fetch metrics", e);
      }
  };

  const fetchTrends = async (repo: string) => {
      try {
          const response = await fetch(`${API_URL}/analysis/trends/${encodeURIComponent(repo)}?days=7`, {
            headers: { 
              'Authorization': `Bearer ${session?.access_token}`,
              'X-GitHub-Token': platform === 'github' ? token || '' : '',
              'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
            }
          });
          
          if (response.ok) {
              const data = await response.json();
              const trends = data.data || {};
              // Ensure trend properties are always arrays
              setTrendsResult({
                  prs_opened: Array.isArray(trends.prs_opened) ? trends.prs_opened : [],
                  avg_merge_time: Array.isArray(trends.avg_merge_time) ? trends.avg_merge_time : [],
                  prs_merged: Array.isArray(trends.prs_merged) ? trends.prs_merged : []
              });
          }
      } catch (e) {
          console.error("Failed to fetch trends", e);
      }
  };

  const fetchAnalysis = async (repo: string) => {
      try {
          // Fetch trends in parallel
          fetchTrends(repo);
          fetchInsights(repo);
          fetchMetrics(repo);

          const response = await fetch(`${API_URL}/analysis/${repo}`, {
            headers: { 
              'Authorization': `Bearer ${session?.access_token}`,
              'X-GitHub-Token': platform === 'github' ? token || '' : '',
              'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
            }
          });
          
          if (response.status === 402) {
              setError("Subscription required. Please upgrade to use this feature.");
              setAnalysisResult(null);
              return;
          }

          const data = await response.json();
          if (response.ok) {
              const result = data.data;
              // Ensure bias_alerts is always an array
              if (result && !Array.isArray(result.bias_alerts)) {
                  result.bias_alerts = [];
              }
              setAnalysisResult(result);
          }
      } catch (e) {
          console.error("Failed to fetch analysis", e);
      }
  };

  const handleDeepAnalysis = async () => {
    if (!token || !repoName) return;
    
    setLoadingAnalysis(true);
    try {
        const response = await fetch(`${API_URL}/classify/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
              'X-GitHub-Token': platform === 'github' ? token || '' : '',
              'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
            },
            body: JSON.stringify({ repo_name: repoName, limit: 50 }) 
        });
        
        if (response.status === 402) {
            setError("Subscription required for Deep Analysis.");
            return;
        }

        const data = await response.json();
        if (response.ok) {
            setClassificationResult(data.data);
            // Refresh analysis to show new stats
            await fetchAnalysis(repoName);
            await fetchHealthCheck(repoName);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingAnalysis(false);
    }
  };

  const handleSubscribe = async () => {
     // Placeholder for subscription logic
  };

  const handleIngest = async () => {
    if (!token) return;
    if (!repoName) {
        setError("Please enter a repository name (owner/repo or project path)");
        return;
    }

    setLoading(true);
    setError(null);
    setIngestResult(null);
    setAnalysisResult(null);
    setHealthCheckResult(null);

    try {
      const response = await fetch(`${API_URL}/ingest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'X-GitHub-Token': platform === 'github' ? token || '' : '',
          'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
        },
        body: JSON.stringify({ 
            repo_name: repoName, 
            limit: 20,
            platform: platform 
        }) 
      });

      if (response.status === 402) {
        throw new Error("Subscription required. Please upgrade to start analyzing repositories.");
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to ingest");
      }

      setIngestResult(data.data);
      // Fetch analysis immediately after ingestion
      await fetchAnalysis(repoName);
      await fetchHealthCheck(repoName);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
      if (!repoName) return;
      try {
          const response = await fetch(`${API_URL}/reports/export?repo_name=${encodeURIComponent(repoName)}&format=${format}`, {
              headers: { 
                'Authorization': `Bearer ${session?.access_token}`,
                'X-GitHub-Token': platform === 'github' ? token || '' : '',
                'X-GitLab-Token': platform === 'gitlab' ? token || '' : ''
              }
          });
          
          if (response.status === 402) {
             setError("Subscription required for export.");
             return;
          }

          if (!response.ok) {
              const err = await response.json();
              setError(err.detail || "Export failed");
              return;
          }

          // Handle download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report_${repoName.replace('/', '_')}.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

      } catch (e: any) {
          console.error(e);
          setError("Failed to download report");
      }
  };

  const handleNukeData = async () => {
    if (!window.confirm("ARE YOU SURE? This will delete ALL ingested data (PRs, reviews, comments) from the database. This action cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/settings/nuke`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to nuke data");
        }

        const data = await response.json();
        alert(data.message || "Data nuked successfully.");
        
        // Reset local state
        setAnalysisResult(null);
        setClassificationResult(null);
        setIngestResult(null);
        setHealthCheckResult(null);
    } catch (e: any) {
        console.error(e);
        alert(`Error: ${e.message}`);
    }
  };

  return (
    <div className="app-container">
      <nav className="nav-bar container">
        <div className="logo">FairMerge</div>
        <div className="nav-links">
          <span>{token ? `${platform.toUpperCase()} Connected` : "Guest"}</span>
          <button onClick={handleLogout} className="btn" style={{ fontSize: '0.9rem' }}>Logout</button>
        </div>
      </nav>

      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Dashboard</h1>
              <p>Welcome to your FairMerge Dashboard.</p>
            </div>
            {profile && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem',
                  background: profile.subscription_status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: profile.subscription_status === 'active' ? '#4ade80' : '#f87171',
                  border: `1px solid ${profile.subscription_status === 'active' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                  {profile.subscription_tier?.toUpperCase() || 'FREE'} - {profile.subscription_status?.toUpperCase() || 'INACTIVE'}
                </span>
              </div>
            )}
          </div>
          
          {/* Auth Status Check */}
          {!token ? (
             <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
                <p style={{ color: '#f87171', marginBottom: '1.5rem' }}>⚠️ You are not connected to a code provider. Connect to start analyzing reviews.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => window.location.href = `${API_URL}/auth/login`}>
                        Connect GitHub
                    </button>
                    <button className="btn btn-primary" style={{ background: '#fc6d26' }} onClick={() => window.location.href = `${API_URL}/auth/gitlab/login`}>
                        Connect GitLab
                    </button>
                </div>
             </div>
          ) : (
            <>
            {/* BYPASS FOR TESTING: Allow access regardless of status */}
            {false && profile?.subscription_status !== 'active' ? (
                <div style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px dashed rgba(99, 102, 241, 0.3)' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Upgrade to Team Plan 🚀</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                        Unlock full PR/MR analysis, bias detection, and AI-powered comment classification for your team.
                    </p>
                    <div style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>
                        $149 <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.7 }}>/ month</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                        <li>✅ GitHub & GitLab Integration</li>
                        <li>✅ Detailed Bias Interaction Matrix</li>
                        <li>✅ AI Comment Classifier (Claude 3.5)</li>
                        <li>✅ 30-day Data Retention</li>
                    </ul>
                    <button onClick={handleSubscribe} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Start Team Subscription
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h3>🔍 Analyze Repository</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                {platform === 'github' ? 'Enter owner/repo (e.g., facebook/react)' : 'Enter project path or ID (e.g., gitlab-org/gitlab)'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
                            <button 
                                onClick={() => {
                                    const t = localStorage.getItem('github_token');
                                    if (t) { setToken(t); setPlatform('github'); localStorage.setItem('active_platform', 'github'); }
                                    else { window.location.href = `${API_URL}/auth/login`; }
                                }}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: platform === 'github' ? 'var(--color-primary)' : 'transparent', color: 'white' }}
                            >
                                GitHub
                            </button>
                            <button 
                                onClick={() => {
                                    const t = localStorage.getItem('gitlab_token');
                                    if (t) { setToken(t); setPlatform('gitlab'); localStorage.setItem('active_platform', 'gitlab'); }
                                    else { window.location.href = `${API_URL}/auth/gitlab/login`; }
                                }}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: platform === 'gitlab' ? '#fc6d26' : 'transparent', color: 'white' }}
                            >
                                GitLab
                            </button>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <input 
                            type="text" 
                            placeholder={platform === 'github' ? "owner/repo" : "project/path or ID"}
                            value={repoName}
                            onChange={(e) => setRepoName(e.target.value)}
                            style={{ 
                                padding: '0.75rem', 
                                borderRadius: '8px', 
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'white',
                                flex: 1,
                                minWidth: '250px'
                            }}
                        />
                        <button 
                            className="btn btn-primary" 
                            onClick={handleIngest}
                            disabled={loading}
                        >
                            {loading ? 'Analyzing...' : 'Start Analysis'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: '1rem', color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                            Error: {error}
                        </div>
                    )}

                    {ingestResult && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Success!</h4>
                            <p>
                                {ingestResult.features > 0
                                    ? `Ingested ${ingestResult.features} new PR${ingestResult.features === 1 ? '' : 's'} from ${ingestResult.repo}.`
                                    : `Repository ${ingestResult.repo} already indexed. Loading existing analysis data.`
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Velocity Gauge */}
            {healthCheckResult && (
                <div style={{ marginTop: '2rem' }}>
                    <VelocityKillerGauge nitpickPercentage={healthCheckResult.nitpick_percentage} />
                </div>
            )}

            {/* Analysis Stats */}
            {analysisResult && !analysisResult.error && analysisResult.summary ? (
            <>
            <AIInsightPanel 
                insights={insights} 
                loading={loadingInsights} 
                onRefresh={() => fetchInsights(repoName)}
            />

            {/* Engineering Velocity Section */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🚀 Engineering Velocity
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0 }}>Cycle Time Trend</h4>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Last 30 Days</span>
                        </div>
                        <CycleTimeChart data={Array.isArray(cycleTimeData) ? cycleTimeData : []} />
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0 }}>Review Velocity</h4>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Last 30 Days</span>
                        </div>
                        <div style={{ flex: 1 }}>
                             <ReviewVelocityChart data={Array.isArray(velocityData) ? velocityData : []} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <MetricCard 
                    title="PRs Analyzed" 
                    value={analysisResult.summary.total_prs || 0}
                    tooltipText="Total number of Pull Requests analyzed in this repository."
                    trendData={trendsResult?.prs_opened}
                    trendLabel="Opened (7d)"
                    color="#6366f1"
                />
                
                <MetricCard 
                    title="Avg Merge Time" 
                    value={`${analysisResult.summary.avg_merge_time_hours || 0}h`}
                    tooltipText="Average time from creation to merge for PRs."
                    trendData={trendsResult?.avg_merge_time}
                    trendLabel="Avg Time (7d)"
                    color="#10b981"
                />
                
                <MetricCard 
                    title="Merge Rate" 
                    value={`${(analysisResult.summary.merge_rate * 100).toFixed(0)}%`}
                    tooltipText="Percentage of PRs that get merged vs closed/open."
                    trendData={trendsResult?.prs_merged}
                    trendLabel="Merges (7d)"
                    color="#f59e0b"
                />
            </div>
            </>
            ) : analysisResult && analysisResult.error ? (
                <div style={{ padding: '2rem', color: '#f87171', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', marginTop: '2rem' }}>
                    <h3>Analysis Error</h3>
                    <p>{analysisResult.error}</p>
                </div>
            ) : null}
            
            {/* Bias Detection Alerts */}
            {analysisResult && analysisResult.bias_alerts && analysisResult.bias_alerts.length > 0 && (
                <div className="card" style={{ marginTop: '2rem', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.02)' }}>
                    <h3 style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⚖️ Bias Detection Alerts
                    </h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analysisResult.bias_alerts.map((alert: any, idx: number) => (
                            <div key={idx} style={{ 
                                padding: '1rem', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                borderRadius: '8px', 
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ color: '#f87171', textTransform: 'uppercase', fontSize: '0.75rem' }}>{alert.type}</strong>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Severity: {alert.severity}</span>
                                </div>
                                <p style={{ margin: 0 }}>{alert.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interaction Heatmap */}
            {analysisResult && analysisResult.interaction_matrix && (
                <InteractionHeatmap matrix={analysisResult.interaction_matrix} />
            )}

            {/* Visual Charts (Reviewers, Categories, Tones) */}
            {analysisResult && (
                <ReviewStatsCharts data={analysisResult} />
            )}

            {/* Export Actions */}
            {analysisResult && (
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                        className="btn" 
                        style={{ border: '1px solid var(--color-border)', background: 'transparent' }}
                        onClick={() => handleExport('csv')}
                    >
                        📄 Export CSV
                    </button>
                    <button 
                        className="btn" 
                        style={{ border: '1px solid var(--color-border)', background: 'transparent' }}
                        onClick={() => handleExport('pdf')}
                    >
                        📑 Export PDF
                    </button>
                </div>
            )}

            {/* Danger Zone */}
            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⛔ Danger Zone
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <div>
                        <strong style={{ color: '#fca5a5' }}>Nuke All Data</strong>
                        <p style={{ fontSize: '0.9rem', color: '#fca5a5', opacity: 0.8, marginTop: '0.25rem' }}>
                            Permanently delete all ingested PRs, reviews, and comments. This cannot be undone.
                        </p>
                    </div>
                    <button 
                        onClick={handleNukeData}
                        style={{ 
                            background: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.75rem 1.5rem', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🔥 Nuke Data
                    </button>
                </div>
            </div>

            {/* AI Analysis Section */}
            {analysisResult && (
                <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🧠 AI Comment Classifier
                            </h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Classify comments to detect nitpicks vs. blocking issues.</p>
                        </div>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleDeepAnalysis}
                            disabled={loadingAnalysis}
                        >
                            {loadingAnalysis ? 'Analyzing...' : 'Run Deep Analysis'}
                        </button>
                    </div>

                    {classificationResult && (
                         <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                            <p style={{ color: '#4ade80' }}>Successfully classified <strong>{classificationResult.classified}</strong> comments using Claude.</p>
                        </div>
                    )}

                    {!classificationResult && (!analysisResult.comment_stats?.categories || Object.keys(analysisResult.comment_stats.categories).length === 0) && (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                            <p>No comments classified yet. Run Deep Analysis to categorize feedback and see charts.</p>
                        </div>
                    )}
                </div>
            )}
            
            </>
          )}
        </div>
      </main>
      
      {/* Ask AI Floating Button */}
      {analysisResult && (
        <AskAIButton onClick={() => setIsAskModalOpen(true)} />
      )}
      
      <AIExplanationModal 
        isOpen={isAskModalOpen} 
        onClose={() => setIsAskModalOpen(false)} 
        repoName={repoName}
        onAsk={handleAskAI}
      />
    </div>
  );
}

export default Dashboard;
