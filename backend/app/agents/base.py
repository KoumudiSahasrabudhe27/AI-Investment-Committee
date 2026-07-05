import json
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import Type, TypeVar
from app.config import config

T = TypeVar("T", bound=BaseModel)


class BaseAgent:
    def __init__(self, name: str, model_name: str = "gemini-2.5-flash"):
        self.name = name
        self.model_name = model_name
        self._client = None

    @property
    def client(self):
        if self._client is None:
            api_key = config.GEMINI_API_KEY

            if not api_key:
                import os
                api_key = os.getenv("GEMINI_API_KEY", "")

            if not api_key:
                raise ValueError("GEMINI_API_KEY is not set.")

            self._client = genai.Client(api_key=api_key)

        return self._client

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
    ) -> T:

        prompt = f"""
{system_prompt}

IMPORTANT:

Return ONLY valid JSON.

Do NOT wrap JSON in markdown.

Do NOT explain anything.

Use EXACTLY the requested field names.

User Request:

{user_prompt}
"""

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
            ),
        )

        text = response.text.strip()

        if text.startswith("```json"):
            text = text[7:]

        if text.startswith("```"):
            text = text[3:]

        if text.endswith("```"):
            text = text[:-3]

        text = text.strip()

        try:
            data = json.loads(text)

            # ==========================================================
            # FIELD ALIASES
            # ==========================================================

            aliases = {

                # ---------- Fundamental ----------
                "valuation_assessment": "valuation_status",
                "valuation": "valuation_status",

                # ---------- Technical ----------
                "overall_technical_trend": "technical_trend",
                "prevailing_trend": "technical_trend",
                "technical_analysis_report": "detailed_analysis",
                "detailed_report": "detailed_analysis",

                # ---------- News ----------
                "overall_news_sentiment": "news_sentiment",
                "market_sentiment_analysis": "detailed_summary",
                "corporate_narrative": "detailed_summary",
                "key_market_concerns": "market_concerns",

                # ---------- Risk ----------
                "overall_risk_rating": "risk_rating",
                "specific_risk_factors": "risk_factors",
                "reasoning": "alignment_reasoning",

                # ---------- Portfolio ----------
                "decision": "recommendation",
                "confidence": "confidence_score",
            }

            for old_key, new_key in aliases.items():
                if old_key in data and new_key not in data:
                    data[new_key] = data.pop(old_key)

            # ==========================================================
            # Risk detailed report
            # ==========================================================

            if "detailed_report" in data:
                report = data.pop("detailed_report")

                if isinstance(report, dict):
                    data["detailed_risk_analysis"] = json.dumps(
                        report,
                        indent=2,
                    )
                else:
                    data["detailed_risk_analysis"] = str(report)

            # ==========================================================
            # Normalize enums
            # ==========================================================

            if "valuation_status" in data:
                value = str(data["valuation_status"]).lower()

                if "under" in value:
                    data["valuation_status"] = "Undervalued"
                elif "fair" in value:
                    data["valuation_status"] = "Fairly Valued"
                else:
                    data["valuation_status"] = "Overvalued"

            if "technical_trend" in data:
                value = str(data["technical_trend"]).lower()

                if "bull" in value:
                    data["technical_trend"] = "Bullish"
                elif "bear" in value:
                    data["technical_trend"] = "Bearish"
                else:
                    data["technical_trend"] = "Neutral"

            if "news_sentiment" in data:
                value = str(data["news_sentiment"]).lower()

                if "positive" in value:
                    data["news_sentiment"] = "Positive"
                elif "negative" in value:
                    data["news_sentiment"] = "Negative"
                else:
                    data["news_sentiment"] = "Neutral"

            # ==========================================================
            # Round numeric scores
            # ==========================================================

            for score in [
                "fundamental_score",
                "momentum_score",
                "sentiment_score",
                "confidence_score",
            ]:
                if score in data:
                    try:
                        data[score] = int(round(float(data[score])))
                    except Exception:
                        pass

            # ==========================================================
            # Defaults
            # ==========================================================

            data.setdefault("bull_points", [])
            data.setdefault("bear_points", [])

            data.setdefault("support_levels", [])
            data.setdefault("resistance_levels", [])

            data.setdefault("key_catalysts", [])
            data.setdefault("market_concerns", [])

            data.setdefault("risk_factors", [])

            data.setdefault(
                "alignment_reasoning",
                "No reasoning provided."
            )

            data.setdefault(
                "detailed_analysis",
                "No detailed analysis provided."
            )

            data.setdefault(
                "detailed_summary",
                "No detailed summary provided."
            )

            data.setdefault(
                "detailed_risk_analysis",
                "No detailed risk analysis provided."
            )

            return response_schema.model_validate(data)

        except Exception as e:
            print(f"\n[{self.name}] Failed JSON Validation\n")
            print("=" * 120)
            print(text)
            print("=" * 120)
            raise e