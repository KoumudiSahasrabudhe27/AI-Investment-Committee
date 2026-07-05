from app.agents.base import BaseAgent
from app.schemas import (
    FinalInvestmentRecommendation,
    FundamentalAnalysis,
    TechnicalAnalysis,
    NewsAnalysis,
    RiskAnalysis
)
import json

class PortfolioManagerAgent(BaseAgent):
    def __init__(self):
        # We can use gemini-1.5-flash for speed and efficiency, but prompt it to act as the final chair
        super().__init__(name="Portfolio Manager", model_name="gemini-2.5-flash")

    def analyze(
        self,
        ticker: str,
        company_info: dict,
        user_params: dict,
        fundamental_report: FundamentalAnalysis,
        technical_report: TechnicalAnalysis,
        news_report: NewsAnalysis,
        risk_report: RiskAnalysis
    ) -> FinalInvestmentRecommendation:
        """
        Acts as the Committee Chair. Integrates analyst reports, weighs their findings
        according to investment horizon/risk tolerance, and issues the final recommendation.
        """
        system_prompt = (
            "You are the Chair and Portfolio Manager of the Investment Committee.\n"
            "Your responsibility is to make the final, binding recommendation (Buy, Hold, or Sell) "
            "for the stock ticker under consideration, and write a professional Investment Memo.\n\n"
            "You must integrate all opinions from the specialized analysts:\n"
            "1. Fundamental Analyst (Value, solvency, metrics, earnings quality)\n"
            "2. Technical Analyst (Tape, trend, indicators, price support/resistance)\n"
            "3. Market News Analyst (Sentiment, news catalysts, management, macro narratives)\n"
            "4. Risk Manager (Suitability check, stop-loss, volatility, leverage checks)\n\n"
            "Weighting Criteria Guide:\n"
            "- Short Horizon (<1yr): Technical Analyst & News Analyst get higher weight (e.g. 50-60%). "
            "  Fundamentals are less important in the short term.\n"
            "- Long Horizon (3+ yrs): Fundamental Analyst gets highest weight (e.g. 60-70%). "
            "  Technicals are secondary for execution/timing.\n"
            "- Risk Profile: If Risk Manager states alignment_verdict = False, you must look very closely. "
            "  A Sell or Hold is highly likely if the risk rating is High and the user's risk tolerance is Low.\n\n"
            "Resolve any committee conflicts. E.g., if Fundamentals are strong (undervalued) but Technicals are weak (downtrend), "
            "explain how the horizon reconciles this (e.g., long horizon uses downtrend as a buying opportunity, short horizon stays out).\n\n"
            "Your output must contain:\n"
            "1. recommendation: 'Buy', 'Hold', or 'Sell'.\n"
            "2. confidence_score: 0 to 100% representing committee consensus strength.\n"
            "3. portfolio_allocation: Allocation suggestions (e.g., 'Allocate 3% of cash ($X) immediately' or 'Dollar cost average over 3 months').\n"
            "4. investment_thesis: A strong, detailed markdown justification for your decision.\n"
            "5. bull_case: Specific metrics/catalysts required to realize the upside target.\n"
            "6. bear_case: Specific failure points or trigger metrics that would invalidate the thesis.\n"
            "7. executive_summary: A high-level overview of the decision and core analyst feedback.\n\n"
            "Deliver a professional-grade, publication-ready Investment Memo."
        )

        user_prompt = (
            f"Stock: {ticker} ({company_info.get('name', '')})\n"
            f"Sector: {company_info.get('sector', '')} | Industry: {company_info.get('industry', '')}\n"
            f"Current Price: {company_info.get('current_price', 0.0)} {company_info.get('currency', 'USD')}\n\n"
            f"=== User Parameters ===\n"
            f"Investment Amount: ${user_params.get('investment_amount'):,.2f}\n"
            f"Investment Horizon: {user_params.get('investment_horizon')}\n"
            f"Risk Tolerance: {user_params.get('risk_tolerance')}\n\n"
            f"=== COMMITTEE REPORTS ===\n"
            f"--- Fundamental Analyst (Score: {fundamental_report.fundamental_score}/10, Valuation: {fundamental_report.valuation_status}) ---\n"
            f"Bull Points: {fundamental_report.bull_points}\n"
            f"Bear Points: {fundamental_report.bear_points}\n"
            f"Details: {fundamental_report.detailed_analysis[:1000]}...\n\n"
            f"--- Technical Analyst (Trend: {technical_report.technical_trend}, Momentum: {technical_report.momentum_score}/10) ---\n"
            f"Support/Resistance: {technical_report.support_levels} / {technical_report.resistance_levels}\n"
            f"Details: {technical_report.detailed_analysis[:1000]}...\n\n"
            f"--- Market News Analyst (Sentiment: {news_report.news_sentiment}, Score: {news_report.sentiment_score}/10) ---\n"
            f"Catalysts: {news_report.key_catalysts}\n"
            f"Concerns: {news_report.market_concerns}\n"
            f"Details: {news_report.detailed_summary[:1000]}...\n\n"
            f"--- Risk Manager (Risk Rating: {risk_report.risk_rating}, Suitability Verdict: {risk_report.alignment_verdict}) ---\n"
            f"Risk Factors: {risk_report.risk_factors}\n"
            f"Suitability Reasoning: {risk_report.alignment_reasoning}\n"
            f"Stop Loss Recommendation: {risk_report.stop_loss_recommendation}\n"
            f"Details: {risk_report.detailed_risk_analysis[:1000]}...\n\n"
            f"Evaluate all consensus views and finalize the Investment Memo in the required JSON schema."
        )

        return self.generate(system_prompt, user_prompt, FinalInvestmentRecommendation)
