export interface UserAnalysisRequest {
  ticker: string;
  investment_amount: number;
  investment_horizon: string;
  risk_tolerance: string;
}

export interface FundamentalAnalysis {
  fundamental_score: number;
  valuation_status: string;
  bull_points: string[];
  bear_points: string[];
  detailed_analysis: string;
  ratios?: Record<string, any>;
}

export interface TechnicalAnalysis {
  technical_trend: string;
  momentum_score: number;
  support_levels: number[];
  resistance_levels: number[];
  detailed_analysis: string;
  current_price?: number;
  chart_data?: any[];
}

export interface NewsAnalysis {
  news_sentiment: string;
  sentiment_score: number;
  key_catalysts: string[];
  market_concerns: string[];
  detailed_summary: string;
}

export interface RiskAnalysis {
  risk_rating: string;
  risk_factors: string[];
  alignment_verdict: boolean;
  alignment_reasoning: string;
  stop_loss_recommendation?: number;
  detailed_risk_analysis: string;
}

export interface FinalInvestmentRecommendation {
  recommendation: string;
  confidence_score: number;
  portfolio_allocation: string;
  investment_thesis: string;
  bull_case: string;
  bear_case: string;
  executive_summary: string;
}

export interface CommitteeResult {
  request: UserAnalysisRequest;
  fundamentals: FundamentalAnalysis;
  technicals: TechnicalAnalysis;
  news: NewsAnalysis;
  risk: RiskAnalysis;
  recommendation: FinalInvestmentRecommendation;
}

export interface ProgressLog {
  agent: string;
  step: string;
  message: string;
}
