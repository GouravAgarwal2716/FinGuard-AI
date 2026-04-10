import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, Zap, TrendingUp, ChevronRight, ChevronDown, BarChart2, Lock, Globe, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Activity, color: '#10b981', title: 'Anomaly Detection', desc: 'Isolation Forest ML model flags unusual price-volume patterns in real time.' },
  { icon: Zap, color: '#f59e0b', title: 'Pump & Dump Detection', desc: 'Cross-correlates volume Z-scores and returns to catch coordinated manipulation.' },
  { icon: BarChart2, color: '#6366f1', title: 'Sentiment Analysis', desc: 'NLP parses global news feeds to score market sentiment and detect mismatches.' },
  { icon: Shield, color: '#ec4899', title: 'Explainable AI', desc: 'Every risk flag is explained in plain language — no black boxes.' },
  { icon: TrendingUp, color: '#3b82f6', title: 'Technical Indicators', desc: 'RSI, MACD, Bollinger Bands, SMA/EMA computed automatically for each ticker.' },
  { icon: Lock, color: '#10b981', title: 'Portfolio Shield', desc: 'Upload your portfolio CSV and get an aggregate risk score across all holdings.' },
];

const STATS = [
  { val: '99.2%', label: 'Detection Accuracy' },
  { val: '< 2s', label: 'Analysis Speed' },
  { val: '50k+', label: 'Assets Covered' },
  { val: '24/7', label: 'Live Monitoring' },
];

export default function Landing() {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-fade-in'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => { (el as HTMLElement).style.opacity = '0'; observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-bg" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 100, marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', animation: 'pulse-ring 2s infinite' }} />
            <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Neural Engine Online · Real-time AI Active</span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1, letterSpacing: '-1px' }}>
            AI-Powered{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Fraud Detection
            </span>
            {' '}for Financial Markets
          </h1>

          <p style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 48, maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7 }}>
            Detect pump & dump schemes, market manipulation, and high-risk investments before they impact your capital. Real-time intelligence powered by deep learning.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 12 }}>
              Start Free Analysis <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 12 }}>
              Sign In
            </Link>
          </div>

          <div style={{ marginTop: 80, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: 'float 2s ease-in-out infinite', fontSize: 13 }}>
            <span>Scroll to explore</span>
            <ChevronDown size={18} />
          </div>
        </div>
      </section>

      {/* ─── Ticker Bar ───────────────────────────────────────────────── */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {['RELIANCE ₹2,940 +1.2%', 'TCS ₹3,820 -0.4%', 'HDFCBANK ₹1,680 +0.8%', 'INFY ₹1,450 +2.1%', 'AAPL $182 +0.6%', 'NVDA $875 +3.4%', 'TSLA $245 -1.8%', 'MSFT $415 +0.9%',
            'RELIANCE ₹2,940 +1.2%', 'TCS ₹3,820 -0.4%', 'HDFCBANK ₹1,680 +0.8%', 'INFY ₹1,450 +2.1%', 'AAPL $182 +0.6%', 'NVDA $875 +3.4%', 'TSLA $245 -1.8%', 'MSFT $415 +0.9%'].map((item, i) => (
            <span key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Fira Code, monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, background: item.includes('+') ? '#10b981' : '#ef4444', borderRadius: '50%' }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-card2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {STATS.map(({ val, label }) => (
              <div key={label} className="reveal" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 48, fontFamily: 'Poppins', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 8 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────── */}
      <section ref={featuresRef} style={{ padding: '100px 24px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }} className="reveal">
            <h2 style={{ fontSize: 42, marginBottom: 16 }}>Enterprise-Grade Intelligence</h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto' }}>Six AI engines working in concert to protect your investments</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16, cursor: 'default', transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = color + '40'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
              >
                <div style={{ width: 52, height: 52, background: color + '20', border: `1px solid ${color}40`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={26} color={color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-card2)', textAlign: 'center' }}>
        <div className="container reveal" style={{ maxWidth: 640, margin: '0 auto' }}>
          <Globe size={56} color="#6366f1" style={{ marginBottom: 24, opacity: 0.8 }} />
          <h2 style={{ fontSize: 42, marginBottom: 20 }}>Protect Your Investments Today</h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.7 }}>
            Join investors using real-time AI to stay ahead of market manipulation and fraudulent schemes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 16, borderRadius: 12 }}>Get Started Free</Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 16, borderRadius: 12 }}>Sign In</Link>
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No credit card', 'Real APIs', 'Full AI engine', '100% secure'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <CheckCircle size={14} color="#10b981" /> {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span>© 2026 FinGuard AI. Enterprise Market Intelligence Platform.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#6366f1'} onMouseLeave={e => (e.target as HTMLElement).style.color = ''}>Privacy</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#6366f1'} onMouseLeave={e => (e.target as HTMLElement).style.color = ''}>Terms</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#6366f1'} onMouseLeave={e => (e.target as HTMLElement).style.color = ''}>API Docs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
