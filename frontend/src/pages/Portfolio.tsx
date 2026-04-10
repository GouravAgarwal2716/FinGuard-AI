import { useState } from 'react';
import { Briefcase, Upload, AlertTriangle, Shield, TrendingDown, ChevronRight, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { stocksAPI } from '../lib/api';
import Layout from '../components/Layout';

interface PortfolioEntry { symbol: string; allocation: number; risk_score?: number; price?: number; }

const COLORS = ['#10b981', '#f59e0b', '#fb923c', '#ef4444', '#6366f1', '#3b82f6', '#ec4899'];

function RiskGauge({ score }: { score: number }) {
  const color = score > 70 ? '#ef4444' : score > 50 ? '#fb923c' : score > 30 ? '#f59e0b' : '#10b981';
  const data = [{ value: score, fill: color }, { value: 100 - score, fill: 'var(--border)' }];
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <ResponsiveContainer width={200} height={200}>
        <RadialBarChart cx={100} cy={100} innerRadius={60} outerRadius={90} startAngle={180} endAngle={0} data={data}>
          <RadialBar dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 42, fontFamily: 'Poppins', fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Portfolio Risk</div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [inputText, setInputText] = useState('AAPL,30\nRELIANCE.NS,25\nTCS.NS,20\nNVDA,15\nHDFCBANK.NS,10');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ aggregateRisk: number; breakdown: PortfolioEntry[] } | null>(null);
  const [error, setError] = useState('');

  const parseInput = (): PortfolioEntry[] | null => {
    const lines = inputText.trim().split('\n').filter(l => l.trim());
    const parsed: PortfolioEntry[] = [];
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 2) { setError(`Invalid line: "${line}" — use format: SYMBOL,ALLOCATION`); return null; }
      const alloc = parseFloat(parts[1]);
      if (isNaN(alloc) || alloc <= 0) { setError(`Invalid allocation for "${parts[0]}"`); return null; }
      parsed.push({ symbol: parts[0].toUpperCase(), allocation: alloc });
    }
    const total = parsed.reduce((s, e) => s + e.allocation, 0);
    if (Math.abs(total - 100) > 1 && total !== 0) {
      // Normalize to 100%
      parsed.forEach(e => e.allocation = Math.round(e.allocation / total * 100));
    }
    return parsed;
  };

  const analyzePortfolio = async () => {
    setError('');
    const parsed = parseInput();
    if (!parsed) return;
    setAnalyzing(true);
    const breakdown: PortfolioEntry[] = [];
    try {
      await Promise.all(parsed.map(async (entry) => {
        try {
          const { data } = await stocksAPI.analyze(entry.symbol, 30);
          breakdown.push({ ...entry, risk_score: data.analysis.risk_score, price: data.current_price });
        } catch {
          breakdown.push({ ...entry, risk_score: 50 });
        }
      }));
      // Weighted aggregate
      const agg = breakdown.reduce((sum, e) => sum + (e.risk_score || 50) * (e.allocation / 100), 0);
      setResult({ aggregateRisk: Math.round(agg), breakdown });
    } catch { setError('Analysis failed. Please check your input and try again.'); }
    setAnalyzing(false);
  };

  const pieData = result?.breakdown.map(e => ({ name: e.symbol.split('.')[0], value: e.allocation, risk: e.risk_score })) || [];

  return (
    <Layout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, marginBottom: 6 }}>Portfolio <span style={{ color: 'var(--primary)' }}>Risk Shield</span></h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Analyze aggregate risk across your entire holdings in seconds</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.6fr' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Input Panel */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Upload size={20} color="var(--primary)" />
            <h2 style={{ fontSize: 18, margin: 0 }}>Portfolio Input</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Enter holdings as <code style={{ background: 'var(--bg-card2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'Fira Code', fontSize: 12 }}>SYMBOL,ALLOCATION%</code> — one per line.</p>

          {error && <div className="alert-banner alert-error" style={{ marginBottom: 16 }}><AlertTriangle size={14} /> {error}</div>}

          <textarea
            className="input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={8}
            style={{ fontFamily: 'Fira Code', fontSize: 13, resize: 'vertical', marginBottom: 16 }}
            placeholder="AAPL,30&#10;TSLA,20&#10;NVDA,25&#10;MSFT,25"
          />
          <button className="btn btn-primary" onClick={analyzePortfolio} disabled={analyzing} style={{ width: '100%', padding: 13 }}>
            {analyzing ? <><RefreshCw size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Analyzing {result?.breakdown.length || 0} positions...</> : <><Shield size={16} /> Analyze Portfolio Risk</>}
          </button>
        </div>

        {/* Results Panel */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Score Card */}
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
              <RiskGauge score={result.aggregateRisk} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>PORTFOLIO VERDICT</div>
                <h3 style={{ fontSize: 24, marginBottom: 8, color: result.aggregateRisk > 70 ? '#ef4444' : result.aggregateRisk > 50 ? '#fb923c' : result.aggregateRisk > 30 ? '#f59e0b' : '#10b981' }}>
                  {result.aggregateRisk > 70 ? '🔴 High Risk' : result.aggregateRisk > 50 ? '🟠 Elevated' : result.aggregateRisk > 30 ? '🟡 Moderate' : '🟢 Healthy'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {result.aggregateRisk > 70
                    ? 'Critical exposure detected. Immediate rebalancing recommended.'
                    : result.aggregateRisk > 50
                    ? 'Elevated risk. Consider reducing high-scoring positions.'
                    : result.aggregateRisk > 30
                    ? 'Moderate risk. Monitor flagged positions closely.'
                    : 'Portfolio shows healthy diversification with manageable risk.'}
                </p>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Aggregate Risk</span>
                    <span style={{ fontWeight: 700 }}>{result.aggregateRisk}/100</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${result.aggregateRisk}%`, background: result.aggregateRisk > 70 ? '#ef4444' : result.aggregateRisk > 50 ? '#fb923c' : '#f59e0b', borderRadius: 100 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Allocation Pie */}
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Allocation & Risk Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'center' }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, 'Allocation']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.breakdown.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)).map((e, i) => {
                    const rc = (e.risk_score || 0) > 70 ? '#ef4444' : (e.risk_score || 0) > 50 ? '#fb923c' : (e.risk_score || 0) > 30 ? '#f59e0b' : '#10b981';
                    return (
                      <div key={e.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Fira Code', fontSize: 13, fontWeight: 700, flex: 1 }}>{e.symbol.split('.')[0]}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.allocation}%</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: rc, minWidth: 50, textAlign: 'right' }}>Risk: {e.risk_score}</span>
                        {e.price && <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 70, textAlign: 'right' }}>₹{e.price.toLocaleString()}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.aggregateRisk > 30 && (
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>AI Recommendations</h3>
                {result.breakdown.filter(e => (e.risk_score || 0) > 60).map(e => (
                  <div key={e.symbol} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg-card2)', borderRadius: 10, marginBottom: 8 }}>
                    <TrendingDown size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <span style={{ fontFamily: 'Fira Code', fontWeight: 700, color: '#ef4444' }}>{e.symbol.split('.')[0]}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>
                        Risk score {e.risk_score}/100 — consider reducing {e.allocation}% allocation or hedging this position.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
