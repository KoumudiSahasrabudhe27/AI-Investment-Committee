from app.agents.base import BaseAgent
from app.schemas import TechnicalAnalysis
import json


class TechnicalAnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Technical Analyst",
            model_name="gemini-2.5-flash"
        )

    def analyze(
        self,
        ticker: str,
        company_info: dict,
        technical_data: dict,
    ) -> TechnicalAnalysis:

        system_prompt = """
You are a Senior Technical Analyst.

Analyze ONLY the technical indicators supplied.

Return ONLY valid JSON.

DO NOT return markdown outside the JSON.

DO NOT wrap the response inside ```.

DO NOT invent additional fields.

The JSON MUST EXACTLY match this schema:

{
  "technical_trend": "",
  "momentum_score": 0,
  "support_levels": [],
  "resistance_levels": [],
  "detailed_analysis": ""
}

Rules:

1. technical_trend MUST be exactly one of

"Bullish"

"Bearish"

"Neutral"

2. momentum_score MUST be an INTEGER between 1 and 10.

Never return decimals.

3. support_levels MUST be an array of numbers.

4. resistance_levels MUST be an array of numbers.

5. detailed_analysis MUST contain markdown explaining:

- SMA analysis
- RSI
- MACD
- ATR
- Support
- Resistance
- Overall conclusion

Never create fields such as

stock_symbol
current_price
prevailing_trend
overall_technical_trend
sma_crossover_status
macd_status
rsi_status
volatility_atr

Return ONLY the JSON.
"""

        tech_data_summary = {
            k: v
            for k, v in technical_data.items()
            if k != "chart_data"
        }

        user_prompt = f"""
Ticker: {ticker}

Company:
{company_info.get("name","")}

Technical Data:

{json.dumps(tech_data_summary, indent=2)}
"""

        return self.generate(
            system_prompt,
            user_prompt,
            TechnicalAnalysis,
        )