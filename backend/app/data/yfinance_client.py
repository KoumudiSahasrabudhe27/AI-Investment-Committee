import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, List

def get_ticker_metadata(ticker: str) -> Dict[str, Any]:
    """
    Fetches basic company details.
    """
    try:
        t = yf.Ticker(ticker)
        info = t.info
        return {
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "summary": info.get("longBusinessSummary", "No summary available."),
            "current_price": info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose", 0.0),
            "currency": info.get("currency", "USD")
        }
    except Exception as e:
        print(f"Error fetching metadata for {ticker}: {e}")
        return {
            "name": ticker,
            "sector": "Unknown",
            "industry": "Unknown",
            "summary": "Data fetch failed.",
            "current_price": 0.0,
            "currency": "USD"
        }

def get_fundamental_data(ticker: str) -> Dict[str, Any]:
    """
    Fetches fundamental financial data (Income Statement, Balance Sheet, Cash Flow)
    and key valuation ratios.
    """
    try:
        t = yf.Ticker(ticker)
        info = t.info
        
        # Financial statements (transpose or clean to get last 3 years)
        income_stmt = t.calendar or {}
        try:
            is_df = t.income_stmt
            bs_df = t.balance_sheet
            cf_df = t.cashflow
            
            # Format to text/markdown tables or JSON
            is_summary = is_df.iloc[:, :3].to_dict() if not is_df.empty else {}
            bs_summary = bs_df.iloc[:, :3].to_dict() if not bs_df.empty else {}
            cf_summary = cf_df.iloc[:, :3].to_dict() if not cf_df.empty else {}
        except Exception as stmt_err:
            print(f"Failed to fetch detailed statements: {stmt_err}")
            is_summary, bs_summary, cf_summary = {}, {}, {}
            
        ratios = {
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE") or info.get("forwardPE"),
            "peg_ratio": info.get("pegRatio"),
            "price_to_sales": info.get("priceToSalesTrailing12Months"),
            "price_to_book": info.get("priceToBook"),
            "enterprise_to_ebitda": info.get("enterpriseToEbitda"),
            "debt_to_equity": info.get("debtToEquity"),
            "current_ratio": info.get("currentRatio"),
            "quick_ratio": info.get("quickRatio"),
            "return_on_equity": info.get("returnOnEquity"),
            "return_on_assets": info.get("returnOnAssets"),
            "profit_margin": info.get("profitMargins"),
            "operating_margin": info.get("operatingMargins"),
            "revenue_growth": info.get("revenueGrowth"),
            "earnings_growth": info.get("earningsGrowth"),
            "free_cash_flow": info.get("freeCashflow"),
            "dividend_yield": info.get("dividendYield"),
            "dividend_rate": info.get("dividendRate")
        }
        
        return {
            "ratios": ratios,
            "income_statement": is_summary,
            "balance_sheet": bs_summary,
            "cash_flow": cf_summary
        }
    except Exception as e:
        print(f"Error fetching fundamentals for {ticker}: {e}")
        return {
            "ratios": {},
            "income_statement": {},
            "balance_sheet": {},
            "cash_flow": {}
        }

def get_technical_data(ticker: str) -> Dict[str, Any]:
    """
    Fetches 1-year daily pricing and computes core technical indicators:
    SMAs (20, 50, 200), RSI, MACD, ATR, Support & Resistance.
    """
    try:
        t = yf.Ticker(ticker)
        df = t.history(period="1y")
        
        if df.empty or len(df) < 50:
            return {"error": "Insufficient price history"}
            
        # Standard Technical Indicators
        df["SMA20"] = df["Close"].rolling(window=20).mean()
        df["SMA50"] = df["Close"].rolling(window=50).mean()
        df["SMA200"] = df["Close"].rolling(window=200).mean()
        
        # RSI 14
        delta = df["Close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / (loss + 1e-10) # avoid division by zero
        df["RSI"] = 100 - (100 / (1 + rs))
        
        # MACD
        ema12 = df["Close"].ewm(span=12, adjust=False).mean()
        ema26 = df["Close"].ewm(span=26, adjust=False).mean()
        df["MACD"] = ema12 - ema26
        df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()
        
        # ATR 14
        high_low = df["High"] - df["Low"]
        high_cp = np.abs(df["High"] - df["Close"].shift())
        low_cp = np.abs(df["Low"] - df["Close"].shift())
        tr = pd.concat([high_low, high_cp, low_cp], axis=1).max(axis=1)
        df["ATR"] = tr.rolling(14).mean()
        
        # Identify Support & Resistance (local minima/maxima over rolling windows)
        # Simple estimation: min/max of the past 60 days
        recent_df = df.tail(60)
        support = float(recent_df["Low"].min())
        resistance = float(recent_df["High"].max())
        
        # Current values
        latest = df.iloc[-1]
        
        # Historical prices list for charts (last 100 entries to keep it light)
        chart_data = []
        chart_df = df.tail(100)
        for date, row in chart_df.iterrows():
            chart_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "close": float(row["Close"]),
                "sma20": float(row["SMA20"]) if not pd.isna(row["SMA20"]) else None,
                "sma50": float(row["SMA50"]) if not pd.isna(row["SMA50"]) else None,
                "sma200": float(row["SMA200"]) if not pd.isna(row["SMA200"]) else None,
            })
            
        return {
            "current_price": float(latest["Close"]),
            "sma20": float(latest["SMA20"]) if not pd.isna(latest["SMA20"]) else None,
            "sma50": float(latest["SMA50"]) if not pd.isna(latest["SMA50"]) else None,
            "sma200": float(latest["SMA200"]) if not pd.isna(latest["SMA200"]) else None,
            "rsi": float(latest["RSI"]) if not pd.isna(latest["RSI"]) else None,
            "macd": float(latest["MACD"]) if not pd.isna(latest["MACD"]) else None,
            "macd_signal": float(latest["MACD_Signal"]) if not pd.isna(latest["MACD_Signal"]) else None,
            "atr": float(latest["ATR"]) if not pd.isna(latest["ATR"]) else None,
            "support_levels": [support, float(recent_df["Low"].quantile(0.25))],
            "resistance_levels": [resistance, float(recent_df["High"].quantile(0.75))],
            "chart_data": chart_data
        }
    except Exception as e:
        print(f"Error computing technical analysis for {ticker}: {e}")
        return {
            "current_price": 0.0,
            "sma20": None,
            "sma50": None,
            "sma200": None,
            "rsi": None,
            "macd": None,
            "macd_signal": None,
            "atr": None,
            "support_levels": [],
            "resistance_levels": [],
            "chart_data": []
        }

def get_yfinance_news(ticker: str) -> List[Dict[str, Any]]:
    """
    Fallback news fetching using yfinance.
    """
    try:
        t = yf.Ticker(ticker)
        raw_news = t.news or []
        formatted_news = []
        for n in raw_news[:15]:
            formatted_news.append({
                "title": n.get("title", ""),
                "publisher": n.get("publisher", ""),
                "link": n.get("link", ""),
                "summary": n.get("summary", ""),
                "related_tickers": n.get("relatedTickers", [])
            })
        return formatted_news
    except Exception as e:
        print(f"Error fetching yfinance news for {ticker}: {e}")
        return []
