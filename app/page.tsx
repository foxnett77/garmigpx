'use client';

import { useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setActivities(data.activities);
    } catch (err: any) {
      setError(err.message || 'Errore di connessione a Garmin. Controlla le credenziali.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (activityId: number) => {
    setDownloadingId(activityId);
    setError('');
    
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, activityId })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_${activityId}.gpx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      setError(err.message || 'Impossibile scaricare il file in questo momento.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDistance = (metros: number) => {
    if (!metros) return '0 km';
    return (metros / 1000).toFixed(2) + ' km';
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Garmin GPX <span className="app-version">v0.5</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Scarica le tue attività</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      {activities.length === 0 ? (
        <form onSubmit={handleLogin} className="card">
          <div className="input-group">
            <label className="input-label">Email Garmin</label>
            <input 
              type="email" 
              className="input-field" 
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              required 
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required 
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? <div className="loader"></div> : 'Connetti e Vedi Attività'}
          </button>
        </form>
      ) : (
        <>
          <button onClick={() => setActivities([])} className="btn btn-secondary" style={{ marginBottom: '24px' }}>
            <ArrowLeft size={18} /> Esci
          </button>
          
          <div className="activity-list">
            {activities.map((act) => (
              <div key={act.activityId} className="activity-item">
                <div className="activity-info">
                  <h3>{act.activityName || 'Attività senza nome'}</h3>
                  <p>
                    {new Date(act.startTimeLocal).toLocaleDateString('it-IT')} • {formatDistance(act.distance)}
                  </p>
                </div>
                <button 
                  className="action-btn"
                  onClick={() => handleDownload(act.activityId)}
                  disabled={downloadingId === act.activityId}
                  title="Scarica GPX"
                >
                  {downloadingId === act.activityId ? <div className="loader" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div> : <Download size={20} />}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
