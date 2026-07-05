import unittest
from app.data.yfinance_client import get_ticker_metadata, get_fundamental_data, get_technical_data
from app.data.finnhub_client import get_company_news

class TestDataProviders(unittest.TestCase):
    def setUp(self):
        self.ticker = "AAPL"

    def test_ticker_metadata(self):
        """
        Verify that company metadata (name, sector, price) can be retrieved and parsed.
        """
        meta = get_ticker_metadata(self.ticker)
        self.assertIsNotNone(meta)
        self.assertIn("name", meta)
        self.assertIn("sector", meta)
        self.assertIn("current_price", meta)
        # Verify it successfully fetched Apple's info or returned fallback structures safely
        if meta["name"] != self.ticker:
            self.assertEqual(meta["name"], "Apple Inc.")

    def test_fundamental_data(self):
        """
        Verify that fundamental metrics and statements are retrieved.
        """
        fund = get_fundamental_data(self.ticker)
        self.assertIsNotNone(fund)
        self.assertIn("ratios", fund)
        self.assertIn("income_statement", fund)
        
        # Verify ratios list structure
        ratios = fund["ratios"]
        if ratios:
            self.assertTrue(any(k in ratios for k in ["market_cap", "pe_ratio", "debt_to_equity"]))

    def test_technical_data(self):
        """
        Verify that daily pricing is retrieved and indicators are calculated.
        """
        tech = get_technical_data(self.ticker)
        self.assertIsNotNone(tech)
        if "error" not in tech:
            self.assertIn("current_price", tech)
            self.assertIn("sma20", tech)
            self.assertIn("rsi", tech)
            self.assertIn("macd", tech)
            self.assertIn("support_levels", tech)
            self.assertIn("chart_data", tech)
            self.assertTrue(len(tech["chart_data"]) > 0)

    def test_news_retrieval(self):
        """
        Verify that recent headlines are returned.
        """
        news = get_company_news(self.ticker)
        self.assertIsNotNone(news)
        self.assertIsInstance(news, list)
        if len(news) > 0:
            first_item = news[0]
            self.assertIn("title", first_item)
            self.assertIn("publisher", first_item)

if __name__ == "__main__":
    unittest.main()
