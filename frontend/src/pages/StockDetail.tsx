import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Activity, BarChart2, Zap, BookOpen, Plus, RefreshCw, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, BarChart, Bar, CartesianGrid } from 'recharts';
import { stocksAPI, watchlistAPI } from '../lib/api';
import Layout from '../components/Layout';
import type { StockData } from '../types';

const TABS = ['Overview', 'Risk Analysis', 'Price Chart', 'Volume', 'Sentiment', 'AI Explanation'];

function RiskGauge({ score }: { score: number }) {
  const color = score > 70 ? '#ef4444' : score > 50 ? '#fb923c' : score > 30 ? '#f59e0b' : '#10b981';
  const angle = (score / 100) * 180 - 90;
  const r = 60, cx = 80, cy = 80;
  const arc = (deg: number) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const s = arc(-90), e = arc(-90 + score / 100 * 180);
  const largeArc = score > 50 ? 1 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={160} height={100} viewBox="0 0 160 100">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--border)" strokeWidth={12} strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" />
        <circle cx={cx + (r - 4) * Math.cos((angle) * Math.PI / 180)} cy={cy + (r - 4) * Math.sin((angle) * Math.PI / 180)} r={6} fill={color} />
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={28} fontWeight={800} fontFamily="Poppins" fill="var(--text-primary)">{score}</text>
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize={11} fill="var(--text-muted)">out of 100</text>
      </svg>
      <div className="badge" style={{ fontSize: 14, fontWeight: 700, color, background: color + '20' }}>
        {score > 70 ? '🔴 HIGH RISK' : score > 50 ? '🟠 WARNING' : score > 30 ? '🟡 CAUTION' : '🟢 SAFE'}
      </div>
    </div>
  );
}

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [watchlisted, setWatchlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!symbol) return;
    setLoading(true); setError('');
    try {
      const { data: result } = await stocksAPI.analyze(symbol);
      setData(result);
      // Auto-save to portfolio/watchlist on successful load
      watchlistAPI.add(symbol).then(() => setWatchlisted(true)).catch(() => {});
    } catch (e: any) {
      setError(e.response?.data?.error || `Could not load data for ${symbol}. Ensure correct ticker format (e.g., AAPL or RELIANCE.NS)`);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [symbol]);

  const addToWatchlist = async () => {
    if (!symbol) return;
    setAdding(true);
    try { await watchlistAPI.add(symbol); setWatchlisted(true); } catch {}
    setAdding(false);
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 80, borderRadius: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="card" style={{ textAlign: 'center', padding: 48, maxWidth: 480, margin: '80px auto' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 12 }}>Analysis Failed</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={load}><RefreshCw size={16} /> Retry</button>
          <Link to="/dashboard" className="btn btn-ghost">← Dashboard</Link>
        </div>
      </div>
    </Layout>
  );

  if (!data) return null;
  const { analysis, technicals, xai, historical_data, anomaly_points, news_headlines } = data;
  const isUp = data.price_change_pct >= 0;
  const chartColor = isUp ? '#10b981' : '#ef4444';

  // Chart data
  const chartData = historical_data.map(d => ({ ...d, date: d.date.slice(5) }));
  const anomalySet = new Set(anomaly_points.map(a => a.date));

  return (
    <Layout>
      {/* ─── Stock Header ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 36, margin: 0 }}>{symbol?.split('.')[0]}</h1>
            <span className={`badge ${analysis.risk_score > 70 ? 'badge-danger' : analysis.risk_score > 50 ? 'badge-warning' : 'badge-safe'}`} style={{ fontSize: 12 }}>
              {analysis.risk_category}
            </span>
            {analysis.pump_alert && <span className="badge badge-danger" style={{ gap: 4 }}><Zap size={10} /> PUMP ALERT</span>}
          </div>
          <div style={{ fontFamily: 'Fira Code', fontSize: 13, color: 'var(--text-muted)' }}>{symbol} · EQUITY</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Poppins', fontSize: 36, fontWeight: 800 }}>₹{data.current_price.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              {isUp ? <TrendingUp size={16} color="#10b981" /> : <TrendingDown size={16} color="#ef4444" />}
              <span style={{ fontWeight: 700, color: isUp ? '#10b981' : '#ef4444' }}>{data.price_change_pct > 0 ? '+' : ''}{data.price_change_pct}%</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>({data.price_change_1d > 0 ? '+' : ''}₹{data.price_change_1d})</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={addToWatchlist} disabled={adding || watchlisted}>
            {adding ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : <Plus size={16} />}
            {watchlisted ? 'Watching' : 'Watchlist'}
          </button>
        </div>
      </div>

      {/* ─── Tabs ─────────────────────────────────────────────────────── */}
      <div className="tab-bar" style={{ marginBottom: 24, overflowX: 'auto' }} role="tablist">
        {TABS.map((t, i) => (
          <button key={t} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)} role="tab">{t}</button>
        ))}
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────────── */}
      {tab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'RSI', val: technicals.rsi?.toFixed(1) || '—', note: technicals.rsi > 70 ? 'Overbought' : technicals.rsi < 30 ? 'Oversold' : 'Neutral', color: technicals.rsi > 70 ? '#ef4444' : technicals.rsi < 30 ? '#10b981' : 'var(--text-secondary)' },
            { label: 'SMA 20', val: `₹${technicals.sma_20?.toLocaleString()}`, note: data.current_price > technicals.sma_20 ? '↑ Above MA' : '↓ Below MA', color: data.current_price > technicals.sma_20 ? '#10b981' : '#ef4444' },
            { label: 'SMA 50', val: `₹${technicals.sma_50?.toLocaleString()}`, note: data.current_price > technicals.sma_50 ? '↑ Bullish' : '↓ Bearish', color: data.current_price > technicals.sma_50 ? '#10b981' : '#ef4444' },
            { label: 'MACD', val: technicals.macd?.toFixed(3) || '—', note: technicals.macd > technicals.macd_signal ? 'Bullish Cross' : 'Bearish Cross', color: technicals.macd > technicals.macd_signal ? '#10b981' : '#ef4444' },
            { label: 'BB Upper', val: `₹${technicals.bb_upper?.toLocaleString()}`, note: 'Resistance' },
            { label: 'BB Lower', val: `₹${technicals.bb_lower?.toLocaleString()}`, note: 'Support' },
            { label: 'Vol Ratio', val: `${technicals.vol_ratio?.toFixed(2)}x`, note: technicals.vol_ratio > 2 ? '⚠️ Spike' : 'Normal', color: technicals.vol_ratio > 2 ? '#ef4444' : 'var(--text-secondary)' },
            { label: 'Sentiment', val: analysis.sentiment_label, note: `Score: ${analysis.sentiment_score?.toFixed(2)}`, color: analysis.sentiment_label === 'POSITIVE' ? '#10b981' : analysis.sentiment_label === 'NEGATIVE' ? '#ef4444' : 'var(--text-secondary)' },
          ].map(({ label, val, note, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ fontSize: 20, color: color || 'var(--text-primary)' }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{note}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>Overall Risk Score</h3>
            <RiskGauge score={analysis.risk_score} />
            <div style={{ marginTop: 24, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.explanation}</div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>Risk Component Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Anomaly Score', val: Math.min(Math.round(analysis.anomaly_score * 100), 100), color: '#6366f1' },
                { label: 'Volume Spike', val: Math.min(Math.round((technicals.vol_ratio - 1) * 20), 100), color: '#f59e0b' },
                { label: 'Sentiment Risk', val: analysis.sentiment_label === 'NEGATIVE' ? 70 : analysis.sentiment_label === 'POSITIVE' ? 30 : 20, color: '#10b981' },
                { label: 'Pump Pattern', val: analysis.pump_alert ? 90 : 10, color: '#ef4444' },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{Math.max(val, 0)}/100</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(val, 0)}%`, background: color, borderRadius: 100, transition: 'width 1.2s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16 }}>Price History · <span style={{ color: 'var(--primary)', fontFamily: 'Fira Code' }}>{symbol}</span></h3>
            {anomaly_points.length > 0 && <span className="badge badge-danger"><AlertTriangle size={10} /> {anomaly_points.length} anomalies detected</span>}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Price']}
              />
              <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r: 5 }} />
              {anomaly_points.map(a => {
                const d = chartData.find(c => c.date === a.date.slice(5));
                if (!d) return null;
                return <ReferenceDot key={a.date} x={d.date} y={a.price} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 3 && (
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Volume Analysis</h3>
          <div className="alert-banner alert-warning" style={{ marginBottom: 20 }}>
            Current volume is <strong>{technicals.vol_ratio?.toFixed(1)}x</strong> the 20-day average
            {technicals.vol_ratio > 3 && ' — CRITICAL spike detected, potential manipulation.'}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} formatter={(v: any) => [`${(Number(v) / 1e6).toFixed(2)}M`, 'Volume']} />
              <Bar dataKey="volume" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 4 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Sentiment Score</h3>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(${analysis.sentiment_label === 'POSITIVE' ? '#10b981' : analysis.sentiment_label === 'NEGATIVE' ? '#ef4444' : '#f59e0b'} ${(analysis.sentiment_score + 1) / 2 * 360}deg, var(--border) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>
                  {analysis.sentiment_label === 'POSITIVE' ? '😊' : analysis.sentiment_label === 'NEGATIVE' ? '😟' : '😐'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: analysis.sentiment_label === 'POSITIVE' ? '#10b981' : analysis.sentiment_label === 'NEGATIVE' ? '#ef4444' : '#f59e0b' }}>{analysis.sentiment_label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Score: {analysis.sentiment_score?.toFixed(3)}</div>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Headlines</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {news_headlines.map((h, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 0', borderBottom: i < news_headlines.length - 1 ? '1px solid var(--border)' : 'none', lineHeight: 1.5 }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
              <BookOpen size={20} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>AI Analysis Summary</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{xai.summary}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {xai.risk_factors.map((f, i) => {
              const severityColor = { CRITICAL: '#ef4444', HIGH: '#fb923c', MEDIUM: '#f59e0b', LOW: '#10b981' }[f.severity] || '#6366f1';
              return (
                <div key={i} className="card" style={{ borderLeft: `3px solid ${severityColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{f.factor}</span>
                    <span className="badge" style={{ background: severityColor + '20', color: severityColor, fontSize: 10 }}>{f.severity}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{f.explanation}</p>
                  <div style={{ fontSize: 12, fontWeight: 600, color: severityColor, fontFamily: 'Fira Code' }}>{f.impact}</div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {xai.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 16px', background: 'var(--bg-card2)', borderRadius: 10 }}>
                  <ChevronRight size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
