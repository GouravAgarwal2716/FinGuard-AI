import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, AlertTriangle, Clock, Activity, RefreshCw, Shield } from 'lucide-react';
import { stocksAPI, historyAPI } from '../lib/api';
import Layout from '../components/Layout';
import type { StockData, SearchHistoryItem, MarketItem } from '../types';

// --- Mini stock card (fetches its own data) ---
function StockCard({ ticker }: { ticker: string }) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    stocksAPI.analyze(ticker, 30)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 160 }}>
      <div className="skeleton" style={{ height: 20, width: '40%' }} />
      <div className="skeleton" style={{ height: 32, width: '60%' }} />
      <div className="skeleton" style={{ height: 6, width: '100%', marginTop: 'auto' }} />
    </div>
  );

  if (!data) return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 160, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Activity size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>{ticker.split('.')[0]}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Analysis temporarily unavailable.<br/>(Rate limited)</div>
    </div>
  );

  const { analysis, current_price, price_change_pct, symbol } = data;
  const isUp = price_change_pct >= 0;
  const riskColor = analysis.risk_score > 70 ? '#ef4444' : analysis.risk_score > 50 ? '#fb923c' : analysis.risk_score > 30 ? '#f59e0b' : '#10b981';

  return (
    <div className="card" onClick={() => navigate(`/stock/${ticker}`)} style={{ cursor: 'pointer', transition: 'all 0.25s', userSelect: 'none' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'Fira Code, monospace', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{symbol.split('.')[0]}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>NSE · Equities</div>
        </div>
        {analysis.pump_alert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(239,68,68,0.1)', borderRadius: 100, fontSize: 11, color: '#ef4444', fontWeight: 700 }}>
            <AlertTriangle size={10} /> ALERT
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'Poppins', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
        ₹{current_price.toLocaleString()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        {isUp ? <TrendingUp size={14} color="#10b981" /> : <TrendingDown size={14} color="#ef4444" />}
        <span style={{ fontSize: 13, fontWeight: 600, color: isUp ? '#10b981' : '#ef4444' }}>{price_change_pct > 0 ? '+' : ''}{price_change_pct}%</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>today</span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Risk Score</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: riskColor }}>{analysis.risk_score}/100</span>
        </div>
        <div style={{ height: 5, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${analysis.risk_score}%`, background: riskColor, borderRadius: 100, transition: 'width 1s ease' }} />
        </div>
      </div>
    </div>
  );
}

// --- Dashboard ---
export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [tickers, setTickers] = useState<string[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [market, setMarket] = useState<MarketItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    setRefreshing(true);
    try {
      const results = await Promise.allSettled([
        stocksAPI.getTickers(),
        historyAPI.get(),
        stocksAPI.marketOverview(),
      ]);
      
      if (results[0].status === 'fulfilled') setTickers(results[0].value.data || []);
      if (results[1].status === 'fulfilled') setHistory(results[1].value.data || []);
      if (results[2].status === 'fulfilled') setMarket(results[2].value.data?.market || []);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/stock/${search.trim().toUpperCase()}`);
  };

  const safeHistory = Array.isArray(history) ? history : [];
  const safeMarket = Array.isArray(market) ? market : [];

  const riskCounts = safeHistory.reduce((acc, h) => {
    if (h.risk_score > 70) acc.high++;
    else if (h.risk_score > 30) acc.medium++;
    else acc.safe++;
    return acc;
  }, { high: 0, medium: 0, safe: 0 });

  return (
    <Layout>
      {/* ─── Header ─ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Market <span style={{ color: 'var(--primary)' }}>Intelligence</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Real-time AI surveillance across global markets</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input className="input" placeholder="Search symbol (e.g. AAPL)…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, paddingLeft: 40 }} />
            </div>
            <button type="submit" className="btn btn-primary">Analyze</button>
          </form>
          <button className="btn btn-ghost" onClick={loadData} disabled={refreshing} title="Refresh">
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ─── Market Overview Bar ─ */}
      {safeMarket.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
          {safeMarket.map(m => (
            <div key={m.symbol} className="card" style={{ padding: '12px 20px', flexShrink: 0, display: 'flex', gap: 12, alignItems: 'center', minWidth: 150 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Fira Code', fontWeight: 600 }}>{m.symbol}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{m.price.toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.direction === 'up' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                {m.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {m.change_pct > 0 ? '+' : ''}{m.change_pct}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Stat Cards ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div className="stat-card">
          <AlertTriangle size={20} color="#ef4444" />
          <div className="stat-value" style={{ color: '#ef4444' }}>{riskCounts.high}</div>
          <div className="stat-label">High Risk Detected</div>
        </div>
        <div className="stat-card">
          <Activity size={20} color="#6366f1" />
          <div className="stat-value" style={{ color: '#6366f1' }}>{safeHistory.length}</div>
          <div className="stat-label">Total Analyzed</div>
        </div>
        <div className="stat-card">
          <Shield size={20} color="#10b981" />
          <div className="stat-value" style={{ color: '#10b981' }}>{riskCounts.safe}</div>
          <div className="stat-label">Safe Assets</div>
        </div>
        <div className="stat-card">
          <TrendingUp size={20} color="#f59e0b" />
          <div className="stat-value" style={{ color: '#f59e0b' }}>{riskCounts.medium}</div>
          <div className="stat-label">Caution Zones</div>
        </div>
      </div>

      {/* ─── Main Grid ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Stock Grid */}
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} color="#6366f1" /> Live Radar
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {tickers.map(t => <StockCard key={t} ticker={t} />)}
          </div>
        </div>

        {/* Recent History Sidebar */}
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#6366f1" /> Recent Analysis
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {safeHistory.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>Analyze stocks to see history</div>
              </div>
            ) : safeHistory.slice(0, 10).map((h, i) => (
              <Link key={h.id || i} to={`/stock/${h.symbol}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < 9 ? '1px solid var(--border)' : 'none', textDecoration: 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
              >
                <div>
                  <div style={{ fontFamily: 'Fira Code', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{h.symbol.split('.')[0]}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <span className={`badge ${h.risk_score > 70 ? 'badge-danger' : h.risk_score > 50 ? 'badge-warning' : h.risk_score > 30 ? 'badge-caution' : 'badge-safe'}`}>
                  {Math.round(h.risk_score)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
