import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 4000;
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'finguard_secret';

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Auth Middleware ───────────────────────────────────────────────────────────

interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === 'mock_google_token') {
            req.user = { id: 'mock_google_id', email: 'google_user@example.com' };
        } else {
            try {
                req.user = jwt.verify(token, JWT_SECRET) as any;
            } catch {
                // Ignore for optional auth
            }
        }
    }
    next();
};

const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    
    // MOCK BYPASS FOR DEMO
    if (token === 'mock_google_token') {
        req.user = { id: 'mock_google_id', email: 'google_user@example.com' };
        return next();
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway Online', version: '2.0.0', timestamp: new Date() });
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (req: Request, res: Response) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
    if (error) return res.status(400).json({ error: error.message });

    // Create gateway JWT
    const token = jwt.sign({ id: data.user?.id, email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        user: { id: data.user?.id, email, full_name },
        token,
        message: 'Account created successfully'
    });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        user: { id: data.user.id, email: data.user.email, full_name: data.user.user_metadata?.full_name },
        token
    });
});

app.get('/api/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) return res.json({ id: userId, email: req.user!.email });
    return res.json(data);
});

// ─── Stock Analysis Routes (Proxy to AI Engine) ───────────────────────────────

app.get('/api/tickers', async (req, res) => {
    try {
        const { data } = await axios.get(`${AI_ENGINE_URL}/api/tickers`);
        return res.json(data);
    } catch {
        return res.json(["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "AAPL", "NVDA", "TSLA"]);
    }
});

app.get('/api/stocks/analyze/:symbol', optionalAuth, async (req: AuthRequest, res: Response) => {
    const { symbol } = req.params;
    const { days } = req.query;
    try {
        const { data } = await axios.get(`${AI_ENGINE_URL}/api/analyze/${symbol}`, { params: { days } });

        // Save to user history if authenticated
        if (req.user) {
            try {
                await supabase.from('search_history').insert({
                    user_id: req.user.id,
                    symbol,
                    risk_score: data.analysis?.risk_score,
                    risk_category: data.analysis?.risk_category,
                });
            } catch (e) {} // non-blocking
        }

        return res.json(data);
    } catch (err: any) {
        const status = err.response?.status || 500;
        return res.status(status).json({ error: err.response?.data?.detail || 'Analysis failed' });
    }
});

app.get('/api/stocks/sentiment/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const { data } = await axios.get(`${AI_ENGINE_URL}/api/sentiment/${symbol}`);
        return res.json(data);
    } catch (err: any) {
        return res.status(500).json({ error: 'Sentiment analysis failed' });
    }
});

app.get('/api/market/overview', async (req, res) => {
    try {
        const { data } = await axios.get(`${AI_ENGINE_URL}/api/market/overview`);
        return res.json(data);
    } catch {
        return res.json({ market: [], timestamp: new Date() });
    }
});

// ─── Watchlist Routes (Supabase) ─────────────────────────────────────────────

// In-memory mock watchlist for the bypass user
let mockWatchlist: any[] = [];

app.get('/api/watchlist', requireAuth, async (req: AuthRequest, res: Response) => {
    if (req.user?.id === 'mock_google_id') return res.json(mockWatchlist);

    const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

app.post('/api/watchlist', requireAuth, async (req: AuthRequest, res: Response) => {
    const { symbol, company_name } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol required' });

    if (req.user?.id === 'mock_google_id') {
        const existingInfo = mockWatchlist.find(w => w.symbol === (symbol as string).toUpperCase());
        if (!existingInfo) {
            const newItem = { id: `m_w_${Date.now()}`, user_id: req.user.id, symbol: (symbol as string).toUpperCase(), company_name, created_at: new Date().toISOString() };
            mockWatchlist.unshift(newItem);
            return res.json({ message: 'Added to watchlist', item: newItem });
        }
        return res.json({ message: 'Added to watchlist', item: existingInfo });
    }

    const { data, error } = await supabase
        .from('watchlist')
        .upsert({ user_id: req.user!.id, symbol: (symbol as string).toUpperCase(), company_name })
        .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: 'Added to watchlist', item: data[0] });
});

app.delete('/api/watchlist/:symbol', requireAuth, async (req: AuthRequest, res: Response) => {
    const { symbol } = req.params;

    if (req.user?.id === 'mock_google_id') {
        mockWatchlist = mockWatchlist.filter(w => w.symbol !== (symbol as string).toUpperCase());
        return res.json({ message: 'Removed from watchlist' });
    }

    const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', req.user!.id)
        .eq('symbol', (symbol as string).toUpperCase());
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: 'Removed from watchlist' });
});

// ─── History ──────────────────────────────────────────────────────────────────

app.get('/api/history', requireAuth, async (req: AuthRequest, res: Response) => {
    // MOCK DATA FOR BYPASS USER
    if (req.user?.id === 'mock_google_id') {
        const mockHistory = [
            { id: 'm1', symbol: 'TSLA', risk_score: 82, risk_category: 'High Risk', created_at: new Date().toISOString() },
            { id: 'm2', symbol: 'AAPL', risk_score: 45, risk_category: 'Moderate', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: 'm3', symbol: 'NVDA', risk_score: 65, risk_category: 'Elevated Risk', created_at: new Date(Date.now() - 7200000).toISOString() },
            { id: 'm4', symbol: 'MSFT', risk_score: 25, risk_category: 'Low Risk', created_at: new Date(Date.now() - 86400000).toISOString() },
            { id: 'm5', symbol: 'HDFCBANK.NS', risk_score: 35, risk_category: 'Low Risk', created_at: new Date(Date.now() - 172800000).toISOString() },
        ];
        return res.json(mockHistory);
    }

    const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// ─── Alerts ───────────────────────────────────────────────────────────────────

app.get('/api/alerts', requireAuth, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
});

app.put('/api/alerts/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
    const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: 'Marked as read' });
});

// ─── Frontend Static Serving ──────────────────────────────────────────────────

const PUBLIC_DIR = path.join(__dirname, '../public');
app.use(express.static(PUBLIC_DIR));

// ─── Chatbot Route (OpenAI API) ────────────────────────────────────────────────

app.post('/api/chat', requireAuth, async (req: AuthRequest, res: Response) => {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    try {
        const systemPrompt = `You are FinGuard AI, an expert financial assistant.
You help users analyze stock risks, understand market anomalies, and verify algorithmic findings.
Keep responses concise, professional, and easily readable with brief markdown styling if appropriate.
Current context: ${context || 'General market analysis'}`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 250,
                temperature: 0.5
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.json({ reply: response.data.choices[0].message.content });
    } catch (err: any) {
        console.error("OpenAI Error:", err.response?.data || err.message);
        return res.status(500).json({ error: 'Chat AI temporarily unavailable' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🛡️  FinGuard API Gateway running on http://localhost:${PORT}`);
    console.log(`🤖  Proxying AI Engine at ${AI_ENGINE_URL}`);
    console.log(`🗄️  Supabase connected: ${process.env.SUPABASE_URL}\n`);
});

// SPA Fallback: Serve index.html for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
