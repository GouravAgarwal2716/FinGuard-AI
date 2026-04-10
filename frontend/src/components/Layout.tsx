import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Activity, Briefcase,
  Bell, LogOut, Sun, Moon, Menu, X, Search, TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ChatAssistant from './ChatAssistant';

interface LayoutProps { children: ReactNode; }

const NAV_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stock/RELIANCE.NS', icon: Activity, label: 'Analyze Stock' },
  { to: '/watchlist', icon: TrendingUp, label: 'Watchlist' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
];

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('fg-theme') as 'dark' | 'light') || 'dark'
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fg-theme', theme);
  }, [theme]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/stock/${search.trim().toUpperCase()}`);
      setSearch('');
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLanding = location.pathname === '/';

  if (isAuthPage || isLanding) {
    return (
      <>
        {/* Simple nav for landing/auth */}
        <nav className="navbar" style={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
              Fin<span style={{ color: 'var(--primary)' }}>Guard</span> <span style={{ color: 'var(--emerald)', fontSize: 12, fontWeight: 600 }}>AI</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isAuthPage && (
              <>
                <Link to="/login" className="btn btn-ghost" style={{ fontSize: 13 }}>Sign In</Link>
                <Link to="/signup" className="btn btn-primary" style={{ fontSize: 13 }}>Get Started</Link>
              </>
            )}
            <button className="theme-toggle" style={{ position: 'static', width: 36, height: 36 }} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </nav>
        {children}
        <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1 }}>FinGuard<span style={{ color: 'var(--primary)' }}> AI</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>SENTINEL PLATFORM</div>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              className="input"
              placeholder="Search symbol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13, padding: '8px 8px 8px 40px' }}
            />
          </div>
        </form>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 14 }}>Menu</div>

        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to || location.pathname.startsWith(to.split(':')[0]) ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || user?.email?.split('@')[0] || 'Investor'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 4 }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="app-content">
        {/* Mobile navbar */}
        <nav className="navbar" style={{ justifyContent: 'space-between', display: 'flex' }}>
          <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'none' }} className="lg-hidden">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Shield size={22} color="#6366f1" />
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>FinGuard <span style={{ color: '#6366f1' }}>AI</span></span>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex' }}>
              <div className="search-bar" style={{ display: 'flex' }}>
                <Search size={16} className="search-icon" />
                <input className="input" placeholder="Analyze symbol..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 13, padding: '8px 12px 8px 38px', width: 180 }} />
              </div>
            </form>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '8px 12px' }} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </nav>
        <main className="main-content animate-fade-in">
          {children}
        </main>
      </div>
      <ChatAssistant />
    </div>
  );
}
