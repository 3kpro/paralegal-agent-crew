
export interface Lane {
  id: string;
  name: string;
  profile: 'safe' | 'moderate' | 'yolo';
  status: 'active' | 'paused' | 'killed' | 'cooldown';
  current_capital: string;
  total_pnl: string;
  total_pnl_pct: number;
  win_count: number;
  loss_count: number;
  last_trade_at: string | null;
  ai_model_version: string;
}

export interface Trade {
  id: string;
  lane_id: string;
  token_symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  amount: number;
  timestamp: string;
  pnl: number | null;
  pnl_pct: number | null;
}

export interface SystemStatus {
  status: string;
  uptime: number;
  active_lanes: number;
  total_pnl: string;
}
export interface PnLPoint {
  timestamp: string;
  pnl: number;
  total_value: number;
}

export interface LaneAnalytics {
  lane_id: string;
  sharpe_ratio: number;
  max_drawdown: number;
  profit_factor: number;
  pnl_history: PnLPoint[];
}

export interface ReadinessComponent {
  score: number;
  value: number;
  target: number;
  status: string;
  message: string;
}

export interface ReadinessScore {
  overall_score: number;
  is_ready: boolean;
  components: {
    trade_volume: ReadinessComponent;
    win_rate: ReadinessComponent;
    sharpe_ratio: ReadinessComponent;
    drawdown: ReadinessComponent;
    consistency: ReadinessComponent;
    runtime: ReadinessComponent;
  };
  thresholds: Record<string, number>;
  blockers: string[];
}
