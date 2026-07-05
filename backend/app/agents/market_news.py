from app.agents.base import BaseAgent
from app.schemas import NewsAnalysis
import json

class MarketNewsAnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Market News Analyst", model_name="gemini-2.5-flash")

    def analyze(self, ticker: str, company_info: dict, news_data: list) -> NewsAnalysis:
        """
        Analyzes recent news headlines, sentiment, catalysts, and business concerns.
        """
        system_prompt = """
You are a Senior Market News Analyst.

Analyze ONLY the supplied news.

Return ONLY valid JSON.

Do NOT return markdown outside JSON.

The JSON MUST EXACTLY match this schema:

{
  "news_sentiment": "",
  "sentiment_score": 0,
  "key_catalysts": [],
  "market_concerns": [],
  "detailed_summary": ""
}

Rules:

1. news_sentiment MUST be exactly one of

"Positive"

"Negative"

"Neutral"

2. sentiment_score MUST be an INTEGER between 1 and 10.

3. key_catalysts MUST be an array of strings.

4. market_concerns MUST be an array of strings.

5. detailed_summary MUST be a markdown string.

Never create fields named:

overall_news_sentiment
market_sentiment_analysis
corporate_narrative
key_market_concerns

Return ONLY the JSON.
"""

        user_prompt = (
            f"Stock: {ticker} ({company_info.get('name', '')})\n"
            f"Sector: {company_info.get('sector', '')} | Industry: {company_info.get('industry', '')}\n\n"
            f"=== Recent News & Headlines (Last 14 Days) ===\n"
            f"{json.dumps(news_data, indent=2)}\n\n"
            f"Analyze the news and output the structured JSON matching the news analysis schema."
        )

        return self.generate(system_prompt, user_prompt, NewsAnalysis)
