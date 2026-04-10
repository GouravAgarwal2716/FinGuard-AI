import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ChatAssistant() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: 'Hi! I am FinGuard AI, your absolute expert in tracking risks & manipulating patterns. Ask me anything about the markets!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Basic context grabbing based on URL
      const context = window.location.pathname.startsWith('/stock/') 
        ? `User is currently viewing the stock ${window.location.pathname.split('/').pop()}` 
        : 'User is on a general dashboard/portfolio page';

      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fg-token') || 'mock_google_token'}`
        },
        body: JSON.stringify({ message: userMsg, context })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ Error: ${data.error}` }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Connection failed. FinGuard API might be down.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="btn btn-primary"
        style={{
          position: 'fixed', bottom: 24, right: 24, 
          width: 56, height: 56, borderRadius: '50%', 
          padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          zIndex: 9999,
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0)' : 'scale(1)'
        }}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div 
        className="card"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 360, height: 500,
          background: 'var(--bg-card)',
          zIndex: 10000,
          display: 'flex', flexDirection: 'column',
          padding: 0, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px var(--border)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', background: 'linear-gradient(to right, #1e1b4b, var(--bg-card))', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#6366f1', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>FinGuard<span style={{ color: '#6366f1' }}> Chat</span></div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Online
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%', background: m.role === 'user' ? 'var(--bg-card2)' : '#6366f120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.role === 'user' ? <User size={14} color="var(--text-secondary)" /> : <Bot size={14} color="#6366f1" />}
              </div>
              <div style={{
                background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-card2)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '10px 14px', borderRadius: 16,
                borderTopRightRadius: m.role === 'user' ? 4 : 16,
                borderTopLeftRadius: m.role === 'assistant' ? 4 : 16,
                fontSize: 13, lineHeight: 1.5,
                maxWidth: '85%', wordBreak: 'break-word'
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={14} color="#6366f1" />
              </div>
              <div style={{ background: 'var(--bg-card2)', padding: '12px 14px', borderRadius: 16, borderTopLeftRadius: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                <div className="dot-typing" style={{ width: 4, height: 4, background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                <div className="dot-typing" style={{ width: 4, height: 4, background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <div className="dot-typing" style={{ width: 4, height: 4, background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={send} style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div className="search-bar" style={{ display: 'flex', padding: 4, paddingLeft: 12 }}>
            <input 
              className="input" 
              style={{ flex: 1, border: 'none', background: 'transparent', padding: 0, fontSize: 13 }}
              placeholder="Ask about markets..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
              disabled={!input.trim() || loading}
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}} />
    </>
  );
}
