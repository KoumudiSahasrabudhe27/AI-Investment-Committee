from app.agents.base import BaseAgent
from app.schemas import FundamentalAnalysis
import json
import pandas as pd
from datetime import date, datetime


class FundamentalAnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Fundamental Analyst",
            model_name="gemini-2.5-flash"
        )

    def make_json_safe(self, obj):
        """
        Recursively converts pandas objects, timestamps, NaN values,
        and non-JSON-serializable objects into JSON-safe values.
        """

        if isinstance(obj, dict):
            return {
                str(k): self.make_json_safe(v)
                for k, v in obj.items()
            }

        if isinstance(obj, list):
            return [self.make_json_safe(v) for v in obj]

        if isinstance(obj, tuple):
            return [self.make_json_safe(v) for v in obj]

        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()

        if isinstance(obj, (datetime, date)):
            return obj.isoformat()

        try:
            if pd.isna(obj):
                return None
        except Exception:
            pass

        return obj

    def analyze(
        self,
        ticker: str,
        company_info: dict,
        fundamental_data: dict,
    ) -> FundamentalAnalysis:
        """
        Analyzes the company's financial health, valuation,
        profitability and growth.
        """

        safe_ratios = self.make_json_safe(
            fundamental_data.get("ratios", {})
        )

        safe_income = self.make_json_safe(
            fundamental_data.get("income_statement", {})
        )

        safe_balance = self.make_json_safe(
            fundamental_data.get("balance_sheet", {})
        )

        safe_cashflow = self.make_json_safe(
            fundamental_data.get("cash_flow", {})
        )

        system_prompt = """
You are a Senior Fundamental Analyst serving on an AI Investment Committee.

Analyze the company's financial health using the provided financial statements and ratios.

Return ONLY a valid JSON object.

DO NOT return markdown outside the JSON.
DO NOT wrap the JSON in ``` blocks.
DO NOT add explanations before or after the JSON.
DO NOT create extra fields.

The JSON MUST EXACTLY follow this schema:

{
  "fundamental_score": 0,
  "valuation_status": "",
  "bull_points": [],
  "bear_points": [],
  "detailed_analysis": ""
}

Rules:

1. fundamental_score MUST be an INTEGER between 1 and 10.
   Valid examples:
   5
   7
   9

   Invalid examples:
   5.5
   7.2
   8.8

2. valuation_status MUST be EXACTLY one of:

   "Undervalued"

   "Fairly Valued"

   "Overvalued"

3. NEVER create any of these fields:

   valuation

   valuation_assessment

   decision

   recommendation

   verdict

4. bull_points MUST be an array of concise strings.

5. bear_points MUST be an array of concise strings.

6. detailed_analysis MUST be a markdown string explaining:
   - valuation
   - profitability
   - growth
   - liquidity
   - leverage
   - free cash flow
   - final reasoning

Return ONLY the JSON object.

Example:

{
  "fundamental_score": 8,
  "valuation_status": "Fairly Valued",
  "bull_points": [
    "Strong cash flow",
    "Healthy margins"
  ],
  "bear_points": [
    "High valuation",
    "Revenue growth slowing"
  ],
  "detailed_analysis": "## Fundamental Analysis\\nThe company..."
}
"""

        user_prompt = (
            f"Ticker: {ticker}\n"
            f"Company: {company_info.get('name', '')}\n"
            f"Sector: {company_info.get('sector', '')}\n"
            f"Industry: {company_info.get('industry', '')}\n\n"

            f"Business Summary:\n"
            f"{company_info.get('summary', '')}\n\n"

            f"========== RATIOS ==========\n"
            f"{json.dumps(safe_ratios, indent=2)}\n\n"

            f"========== INCOME STATEMENT ==========\n"
            f"{json.dumps(safe_income, indent=2)}\n\n"

            f"========== BALANCE SHEET ==========\n"
            f"{json.dumps(safe_balance, indent=2)}\n\n"

            f"========== CASH FLOW ==========\n"
            f"{json.dumps(safe_cashflow, indent=2)}"
        )

        return self.generate(
            system_prompt,
            user_prompt,
            FundamentalAnalysis,
        )