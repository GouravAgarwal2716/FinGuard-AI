import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Trash2, RefreshCw, Plus, Activity } from 'lucide-react';
import { watchlistAPI, stocksAPI } from '../lib/api';
import Layout from '../components/Layout';
import type { WatchlistItem } from '../types';

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, { price: number; change: number; risk: number }>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await watchlistAPI.get();
      setItems(data);
      // Fetch quick stats for each
      const priceData: typeof prices = {};
      await Promise.all(data.slice(0, 6).map(async (item: WatchlistItem) => {
        try {
          const { data: sd } = await stocksAPI.analyze(item.symbol, 10);
          priceData[item.symbol] = { price: sd.current_price, change: sd.price_change_pct, risk: sd.analysis.risk_score };
        } catch {}
      }));
      setPrices(priceData);
    } catch {}
    setLoading(false);
  };

  const remove = async (symbol: string) => {
    setRemoving(symbol);
    try { await watchlistAPI.remove(symbol); setItems(i => i.filter(x => x.symbol !== symbol)); } catch {}
    setRemoving(null);
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>My <span style={{ color: 'var(--primary)' }}>Watchlist</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{items.length} assets being monitored</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={16} /></button>
          <Link to="/dashboard" className="btn btn-primary"><Plus size={16} /> Add Stock</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 80, maxWidth: 440, margin: '0 auto' }}>
          <TrendingUp size={56} color="var(--text-muted)" style={{ marginBottom: 20, opacity: 0.4 }} />
          <h2 style={{ marginBottom: 12, fontSize: 22 }}>Your watchlist is empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>Start analyzing stocks and click "Add to Watchlist" to monitor them.</p>
          <Link to="/dashboard" className="btn btn-primary"><Plus size={16} /> Discover Stocks</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map(item => {
            const p = prices[item.symbol];
            const riskColor = p ? (p.risk > 70 ? '#ef4444' : p.risk > 50 ? '#fb923c' : p.risk > 30 ? '#f59e0b' : '#10b981') : 'var(--text-muted)';
            return (
              <div key={item.id} className="card" style={{ position: 'relative' }}>
                <button onClick={() => remove(item.symbol)} disabled={removing === item.symbol} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = ''}
                >
                  {removing === item.symbol ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={15} />}
                </button>
                <Link to={`/stock/${item.symbol}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontFamily: 'Fira Code', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>{item.symbol.split('.')[0]}</div>
                  {item.company_name && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{item.company_name}</div>}
                  {p ? (
                    <>
                      <div style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>₹{p.price.toLocaleString()}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.change >= 0 ? '#10b981' : '#ef4444' }}>{p.change >= 0 ? '+' : ''}{p.change}%</span>
                        <span className="badge" style={{ background: riskColor + '20', color: riskColor }}>Risk: {p.risk}</span>
                      </div>
                    </>
                  ) : (
                    <div className="skeleton" style={{ height: 40, marginTop: 8 }} />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
