// ─── Core Data Types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnomalyPoint {
  date: string;
  price: number;
  score: number;
}

export interface TechnicalIndicators {
  sma_20: number;
  sma_50: number;
  ema_12: number;
  macd: number;
  macd_signal: number;
  rsi: number;
  bb_upper: number;
  bb_lower: number;
  vol_ratio: number;
  vol_avg_20: number;
}

export interface XAIFactor {
  factor: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  explanation: string;
  icon: string;
}

export interface XAIExplanation {
  summary: string;
  risk_factors: XAIFactor[];
  recommendations: string[];
}

export interface AnalysisResult {
  risk_score: number;
  risk_category: 'SAFE' | 'CAUTION' | 'WARNING' | 'HIGH_RISK';
  risk_color: string;
  explanation: string;
  is_anomaly: boolean;
  pump_alert: boolean;
  sentiment_score: number;
  sentiment_label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  anomaly_score: number;
}

export interface StockData {
  symbol: string;
  current_price: number;
  price_change_1d: number;
  price_change_pct: number;
  historical_data: HistoricalDataPoint[];
  anomaly_points: AnomalyPoint[];
  analysis: AnalysisResult;
  technicals: TechnicalIndicators;
  xai: XAIExplanation;
  news_headlines: string[];
  analyzed_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  company_name?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  symbol: string;
  alert_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SearchHistoryItem {
  id: string;
  symbol: string;
  risk_score: number;
  risk_category: string;
  created_at: string;
}

export interface MarketItem {
  symbol: string;
  price: number;
  change_pct: number;
  direction: 'up' | 'down';
}
