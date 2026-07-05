import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.config import config
from app.data.yfinance_client import get_yfinance_news

def get_company_news(ticker: str) -> List[Dict[str, Any]]:
    """
    Fetches recent company news (last 14 days) from Finnhub.
    Falls back to yfinance news scraper if Finnhub API Key is missing or request fails.
    """
    api_key = config.FINNHUB_API_KEY
    if not api_key:
        print("Finnhub API key is not configured. Falling back to yfinance news.")
        return get_yfinance_news(ticker)
        
    try:
        # Finnhub requires date range
        end_date = datetime.today().strftime('%Y-%m-%d')
        start_date = (datetime.today() - timedelta(days=14)).strftime('%Y-%m-%d')
        
        url = f"https://finnhub.io/api/v1/company-news?symbol={ticker.upper()}&from={start_date}&to={end_date}&token={api_key}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            raw_news = response.json()
            formatted_news = []
            # Take top 15 news items
            for item in raw_news[:15]:
                formatted_news.append({
                    "title": item.get("headline", ""),
                    "publisher": item.get("source", ""),
                    "link": item.get("url", ""),
                    "summary": item.get("summary", ""),
                    "related_tickers": [ticker.upper()]
                })
            
            if formatted_news:
                return formatted_news
            else:
                print("Finnhub returned empty news list. Trying yfinance fallback.")
                return get_yfinance_news(ticker)
        else:
            print(f"Finnhub API error (status code {response.status_code}). Falling back to yfinance.")
            return get_yfinance_news(ticker)
            
    except Exception as e:
        print(f"Exception while calling Finnhub API: {e}. Falling back to yfinance.")
        return get_yfinance_news(ticker)
