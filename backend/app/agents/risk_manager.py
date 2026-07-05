from app.agents.base import BaseAgent
from app.schemas import RiskAnalysis, FundamentalAnalysis, TechnicalAnalysis, NewsAnalysis
import json

class RiskManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Risk Manager", model_name="gemini-2.5-flash")

    def analyze(
        self,
        ticker: str,
        company_info: dict,
        user_params: dict,
        technical_summary: dict,
        fundamental_report: FundamentalAnalysis,
        technical_report: TechnicalAnalysis,
        news_report: NewsAnalysis
    ) -> RiskAnalysis:
        """
        Evaluates risks and checks suitability of the stock based on the user's investment profile and analyst drafts.
        """
        system_prompt = (
            "You are the Chief Risk Officer (Risk Manager) on an Investment Committee.\n"
            "Your job is to look for reasons NOT to make the investment, expose flaws, "
            "and ensure suitability based on the user's profile.\n\n"
            "Analyze the analyst reports and user constraints. You must:\n"
            "1. Evaluate risk exposure: check leverage (debt-to-equity), cash flow safety, sector headwinds, "
            "technical volatility, beta, and media sentiment.\n"
            "2. Assess suitability: compare the stock's profile with the user's risk tolerance (Low, Medium, High), "
            "investment amount, and investment horizon (Short, Medium, Long).\n"
            "   - Low risk tolerance users should NOT invest in high-beta (>1.2), overvalued, unprofitable, "
            "     or highly volatile, news-sensitive speculative stocks.\n"
            "   - Short horizon users are highly exposed to technical downtrends and immediate volatility.\n"
            "3. Assign an overall risk rating: 'Low', 'Medium', or 'High'.\n"
            "4. Provide a binary alignment_verdict (True/False) on whether the stock fits the user's profile.\n"
            "5. Supply a logical reasoning for suitability and list specific risk factors.\n"
            "6. Recommend a logical stop-loss limit based on support levels or technical volatility (ATR).\n"
            "7. Compile a detailed markdown report analyzing risks and mitigation strategies.\n\n"
            "Be critical and skeptical. Act as a sanity check on over-optimistic analysts."
        )

        user_prompt = (
            f"Stock: {ticker} ({company_info.get('name', '')})\n"
            f"Current Price: {company_info.get('current_price', 0.0)} {company_info.get('currency', 'USD')}\n\n"
            f"=== User Parameters ===\n"
            f"Investment Amount: ${user_params.get('investment_amount'):,.2f}\n"
            f"Investment Horizon: {user_params.get('investment_horizon')}\n"
            f"Risk Tolerance: {user_params.get('risk_tolerance')}\n\n"
            f"=== Volatility Data (Recent Support/ATR) ===\n"
            f"- Support Levels: {technical_summary.get('support_levels', [])}\n"
            f"- Resistance Levels: {technical_summary.get('resistance_levels', [])}\n"
            f"- Average True Range (ATR): {technical_summary.get('atr', 'N/A')}\n\n"
            f"=== Fundamental Analyst Draft ===\n"
            f"- Score: {fundamental_report.fundamental_score}/10\n"
            f"- Valuation: {fundamental_report.valuation_status}\n"
            f"- Bull Points: {fundamental_report.bull_points}\n"
            f"- Bear Points: {fundamental_report.bear_points}\n\n"
            f"=== Technical Analyst Draft ===\n"
            f"- Trend: {technical_report.technical_trend}\n"
            f"- Momentum Score: {technical_report.momentum_score}/10\n"
            f"- Support: {technical_report.support_levels}\n"
            f"- Resistance: {technical_report.resistance_levels}\n\n"
            f"=== Market News Analyst Draft ===\n"
            f"- Sentiment: {news_report.news_sentiment} (Score: {news_report.sentiment_score}/10)\n"
            f"- Catalysts: {news_report.key_catalysts}\n"
            f"- Concerns: {news_report.market_concerns}\n\n"
            f"Based on the inputs, compute the risk assessment and return the JSON matching the schema."
        )

        return self.generate(system_prompt, user_prompt, RiskAnalysis)
