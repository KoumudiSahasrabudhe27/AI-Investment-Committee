from pydantic import BaseModel, Field
from typing import List, Optional

class UserAnalysisRequest(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol (e.g. AAPL)")
    investment_amount: float = Field(..., description="Amount of money to invest ($)")
    investment_horizon: str = Field(..., description="Investment horizon: 'Short' (<1yr), 'Medium' (1-3yrs), 'Long' (3+ yrs)")
    risk_tolerance: str = Field(..., description="Risk tolerance: 'Low', 'Medium', 'High'")

class FundamentalAnalysis(BaseModel):
    fundamental_score: int = Field(..., description="Rating out of 10 for financial strength/fundamentals")
    valuation_status: str = Field(..., description="Valuation status: 'Undervalued', 'Fairly Valued', or 'Overvalued'")
    bull_points: List[str] = Field(..., description="List of positive financial indicators or strengths")
    bear_points: List[str] = Field(..., description="List of negative financial indicators or weaknesses")
    detailed_analysis: str = Field(..., description="Detailed markdown fundamental report")
    ratios: Optional[dict] = Field(default={}, description="Key financial ratios dictionary")

class TechnicalAnalysis(BaseModel):
    technical_trend: str = Field(..., description="Trend direction: 'Bullish', 'Bearish', or 'Neutral'")
    momentum_score: int = Field(..., description="Momentum rating from 1 to 10")
    support_levels: List[float] = Field(..., description="Key support price levels")
    resistance_levels: List[float] = Field(..., description="Key resistance price levels")
    detailed_analysis: str = Field(..., description="Detailed markdown technical report")
    current_price: Optional[float] = Field(0.0, description="Current stock price")
    chart_data: Optional[List[dict]] = Field(default=[], description="Historical chart data list")

class NewsAnalysis(BaseModel):
    news_sentiment: str = Field(..., description="News sentiment direction: 'Positive', 'Negative', or 'Neutral'")
    sentiment_score: int = Field(..., description="News sentiment rating from 1 to 10")
    key_catalysts: List[str] = Field(..., description="Core news events driving the stock positive or negative")
    market_concerns: List[str] = Field(..., description="Pressing market or business concerns mentioned in the news")
    detailed_summary: str = Field(..., description="Detailed markdown summary of news catalysts and media narrative")

class RiskAnalysis(BaseModel):
    risk_rating: str = Field(..., description="Calculated overall risk: 'Low', 'Medium', or 'High'")
    risk_factors: List[str] = Field(..., description="Specific risks identified (macro, regulatory, valuation, charts, etc.)")
    alignment_verdict: bool = Field(..., description="True if stock fits user's risk tolerance and investment parameters")
    alignment_reasoning: str = Field(..., description="Brief reason explaining suitability or deviation")
    stop_loss_recommendation: Optional[float] = Field(None, description="Suggested stop loss price limit")
    detailed_risk_analysis: str = Field(..., description="Detailed markdown risk evaluation and risk-mitigation strategies")

class FinalInvestmentRecommendation(BaseModel):
    recommendation: str = Field(..., description="Recommendation: 'Buy', 'Hold', or 'Sell'")
    confidence_score: int = Field(..., description="Confidence score from 0% to 100%")
    portfolio_allocation: str = Field(..., description="Suggested allocation strategy (e.g. DCA, percentage size)")
    investment_thesis: str = Field(..., description="Detailed core narrative justifying decision")
    bull_case: str = Field(..., description="The optimistic scenario expectations")
    bear_case: str = Field(..., description="The pessimistic scenario expectations")
    executive_summary: str = Field(..., description="Brief summary encapsulating the final decision and committee consensus")

class CommitteeResult(BaseModel):
    request: UserAnalysisRequest
    fundamentals: FundamentalAnalysis
    technicals: TechnicalAnalysis
    news: NewsAnalysis
    risk: RiskAnalysis
    recommendation: FinalInvestmentRecommendation
