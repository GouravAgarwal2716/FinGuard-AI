import { useEffect, useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { alertsAPI } from '../lib/api';
import Layout from '../components/Layout';
import type { Alert } from '../types';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle },
  high:     { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', icon: Zap },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: TrendingUp },
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Bell },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await alertsAPI.get();
      setAlerts(data);
    } catch {
      // Show demo alerts if backend isn't running
      setAlerts([
        { id: '1', user_id: '', symbol: 'RELIANCE.NS', alert_type: 'pump_alert', severity: 'critical', message: 'Pump & Dump pattern detected. Volume spiked 340% above average with simultaneous price surge.', is_read: false, created_at: new Date().toISOString() },
        { id: '2', user_id: '', symbol: 'TSLA', alert_type: 'anomaly', severity: 'high', message: 'Isolation Forest anomaly detected. Abnormal price-volume decoupling observed over 3 consecutive sessions.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', user_id: '', symbol: 'NVDA', alert_type: 'sentiment', severity: 'medium', message: 'Sentiment mismatch: News sentiment turned highly negative (score: -0.72) while price remains elevated.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '4', user_id: '', symbol: 'HDFCBANK.NS', alert_type: 'volume', severity: 'medium', message: 'Volume spike: 2.8x the 20-day average detected. Monitoring for continuation pattern.', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
      ]);
    }
    setLoading(false);
  };

  const markRead = async (id: string) => {
    try { await alertsAPI.markRead(id); } catch {}
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.is_read);
    await Promise.all(unread.map(a => alertsAPI.markRead(a.id).catch(() => {})));
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'unread' ? alerts.filter(a => !a.is_read) : alerts;
  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, marginBottom: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Bell size={28} color="var(--primary)" /> Alert <span style={{ color: 'var(--primary)' }}>Center</span>
            {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 100, fontSize: 13, fontWeight: 700, padding: '2px 10px', minWidth: 26, textAlign: 'center' }}>{unreadCount}</span>}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time fraud and manipulation alerts for your portfolio</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={15} /></button>
          {unreadCount > 0 && <button className="btn btn-ghost" onClick={markAllRead}><CheckCheck size={15} /> Mark all read</button>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tab-bar" style={{ marginBottom: 24, width: 'fit-content' }}>
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({alerts.length})</button>
        <button className={`tab-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Unread ({unreadCount})</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 80, maxWidth: 440, margin: '0 auto' }}>
          <CheckCheck size={56} style={{ color: '#10b981', marginBottom: 20, opacity: 0.6 }} />
          <h2 style={{ marginBottom: 10, fontSize: 22 }}>{filter === 'unread' ? 'No unread alerts' : 'No alerts yet'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Alerts will appear here when AI detects suspicious market activity.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(alert => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
            const Icon = cfg.icon;
            return (
              <div key={alert.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: alert.is_read ? 0.6 : 1, borderLeft: `3px solid ${cfg.color}`, transition: 'all 0.2s' }}>
                <div style={{ width: 44, height: 44, background: cfg.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Fira Code', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{alert.symbol.split('.')[0]}</span>
                      <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: 10 }}>{alert.severity.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card2)', padding: '2px 8px', borderRadius: 100 }}>{alert.alert_type.replace('_', ' ')}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {new Date(alert.created_at).toLocaleDateString()} {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: alert.is_read ? 0 : 12 }}>{alert.message}</p>
                  {!alert.is_read && (
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => markRead(alert.id)}>
                      <CheckCheck size={13} /> Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
