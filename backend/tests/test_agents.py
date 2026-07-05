import os
# Mock key for instantiation testing before imports are evaluated
os.environ["GEMINI_API_KEY"] = "AIzaSyFakeKey_ForTesting"

import unittest
from app.schemas import (
    FundamentalAnalysis,
    TechnicalAnalysis,
    NewsAnalysis,
    RiskAnalysis,
    FinalInvestmentRecommendation
)
from app.agents.fundamental import FundamentalAnalystAgent
from app.agents.technical import TechnicalAnalystAgent
from app.agents.market_news import MarketNewsAnalystAgent
from app.agents.risk_manager import RiskManagerAgent
from app.agents.portfolio_mgr import PortfolioManagerAgent

class TestAgents(unittest.TestCase):
    def test_agent_instantiations(self):
        """
        Verify that all agent classes can be imported and initialized without errors.
        """
        try:
            fundamental_agent = FundamentalAnalystAgent()
            technical_agent = TechnicalAnalystAgent()
            news_agent = MarketNewsAnalystAgent()
            risk_agent = RiskManagerAgent()
            portfolio_agent = PortfolioManagerAgent()
            
            self.assertEqual(fundamental_agent.name, "Fundamental Analyst")
            self.assertEqual(technical_agent.name, "Technical Analyst")
            self.assertEqual(news_agent.name, "Market News Analyst")
            self.assertEqual(risk_agent.name, "Risk Manager")
            self.assertEqual(portfolio_agent.name, "Portfolio Manager")
        except Exception as e:
            self.fail(f"Agent initialization failed: {e}")

    def test_fundamental_schema_validation(self):
        """
        Verify validation of the FundamentalAnalysis Pydantic schema.
        """
        data = {
            "fundamental_score": 8,
            "valuation_status": "Undervalued",
            "bull_points": ["Strong balance sheet", "High net profit margin"],
            "bear_points": ["Declining cash flows"],
            "detailed_analysis": "# Analysis Summary\nFundamentals are stable."
        }
        try:
            model = FundamentalAnalysis.model_validate(data)
            self.assertEqual(model.fundamental_score, 8)
            self.assertEqual(model.valuation_status, "Undervalued")
        except Exception as e:
            self.fail(f"Schema validation failed: {e}")

    def test_technical_schema_validation(self):
        """
        Verify validation of the TechnicalAnalysis Pydantic schema.
        """
        data = {
            "technical_trend": "Bullish",
            "momentum_score": 9,
            "support_levels": [150.0, 145.5],
            "resistance_levels": [165.0, 170.0],
            "detailed_analysis": "# Technical Analysis\nStrong breakout patterns."
        }
        try:
            model = TechnicalAnalysis.model_validate(data)
            self.assertEqual(model.technical_trend, "Bullish")
            self.assertEqual(model.momentum_score, 9)
        except Exception as e:
            self.fail(f"Schema validation failed: {e}")

    def test_news_schema_validation(self):
        """
        Verify validation of the NewsAnalysis Pydantic schema.
        """
        data = {
            "news_sentiment": "Positive",
            "sentiment_score": 7,
            "key_catalysts": ["Earnings beat", "New product announcement"],
            "market_concerns": ["Regulatory headwinds"],
            "detailed_summary": "# News Summary\nOverall sentiment is bullish."
        }
        try:
            model = NewsAnalysis.model_validate(data)
            self.assertEqual(model.news_sentiment, "Positive")
            self.assertEqual(model.sentiment_score, 7)
        except Exception as e:
            self.fail(f"Schema validation failed: {e}")

    def test_risk_schema_validation(self):
        """
        Verify validation of the RiskAnalysis Pydantic schema.
        """
        data = {
            "risk_rating": "Medium",
            "risk_factors": ["High leverage", "Macro headwinds"],
            "alignment_verdict": True,
            "alignment_reasoning": "Fits user's medium risk profile.",
            "stop_loss_recommendation": 135.0,
            "detailed_risk_analysis": "# Risk Analysis\nLeverage is manageable."
        }
        try:
            model = RiskAnalysis.model_validate(data)
            self.assertEqual(model.risk_rating, "Medium")
            self.assertTrue(model.alignment_verdict)
        except Exception as e:
            self.fail(f"Schema validation failed: {e}")

    def test_recommendation_schema_validation(self):
        """
        Verify validation of the FinalInvestmentRecommendation Pydantic schema.
        """
        data = {
            "recommendation": "Buy",
            "confidence_score": 85,
            "portfolio_allocation": "Allocate 5% of capital immediately.",
            "investment_thesis": "# Thesis\nLong-term compounding opportunity.",
            "bull_case": "Revenue growth accelerates.",
            "bear_case": "Margin contraction.",
            "executive_summary": "Buy AAPL due to solid earnings and technical indicators."
        }
        try:
            model = FinalInvestmentRecommendation.model_validate(data)
            self.assertEqual(model.recommendation, "Buy")
            self.assertEqual(model.confidence_score, 85)
        except Exception as e:
            self.fail(f"Schema validation failed: {e}")

if __name__ == "__main__":
    unittest.main()
