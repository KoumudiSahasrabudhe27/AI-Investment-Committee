import json
import asyncio
from typing import AsyncGenerator
from app.schemas import UserAnalysisRequest, CommitteeResult
from app.data.yfinance_client import get_ticker_metadata, get_fundamental_data, get_technical_data
from app.data.finnhub_client import get_company_news
from app.agents.fundamental import FundamentalAnalystAgent
from app.agents.technical import TechnicalAnalystAgent
from app.agents.market_news import MarketNewsAnalystAgent
from app.agents.risk_manager import RiskManagerAgent
from app.agents.portfolio_mgr import PortfolioManagerAgent

class CommitteeOrchestrator:
    def __init__(self):
        self.fundamental_agent = FundamentalAnalystAgent()
        self.technical_agent = TechnicalAnalystAgent()
        self.news_agent = MarketNewsAnalystAgent()
        self.risk_agent = RiskManagerAgent()
        self.portfolio_agent = PortfolioManagerAgent()

    async def run_analysis_stream(self, request: UserAnalysisRequest) -> AsyncGenerator[str, None]:
        """
        Runs the multi-agent analysis and streams progress logs, ending with the full CommitteeResult.
        Yields strings formatted for Server-Sent Events (SSE).
        """
        ticker = request.ticker.upper().strip()
        user_params = {
            "investment_amount": request.investment_amount,
            "investment_horizon": request.investment_horizon,
            "risk_tolerance": request.risk_tolerance
        }
        
        def format_sse(event: str, data: dict) -> str:
            return f"event: {event}\ndata: {json.dumps(data)}\n\n"

        try:
            # 1. Fetching Data
            yield format_sse("progress", {
                "agent": "System",
                "step": "data_fetch",
                "message": f"Fetching company metadata and financials for {ticker}..."
            })
            
            # Run fetches in background threadpool since yfinance is blocking
            loop = asyncio.get_event_loop()
            metadata = await loop.run_in_executor(None, get_ticker_metadata, ticker)
            
            if metadata.get("current_price") == 0.0 and metadata.get("name") == ticker:
                # Basic validation: if we couldn't resolve price and name, ticker is likely invalid
                yield format_sse("error", {"message": f"Ticker '{ticker}' could not be resolved. Please check the symbol and try again."})
                return

            yield format_sse("progress", {
                "agent": "System",
                "step": "data_fetch",
                "message": f"Fetched profile for {metadata.get('name')}. Downloading financial statements and news..."
            })
            
            fundamentals_raw = await loop.run_in_executor(None, get_fundamental_data, ticker)
            technicals_raw = await loop.run_in_executor(None, get_technical_data, ticker)
            news_raw = await loop.run_in_executor(None, get_company_news, ticker)
            
            # 2. Parallel Analyst runs (simulated or actual)
            # Run them in executors in parallel using gather
            yield format_sse("progress", {
                "agent": "Fundamental Analyst",
                "step": "fundamental_analysis",
                "message": "Analyzing income statements, balance sheets, and key ratios..."
            })
            yield format_sse("progress", {
                "agent": "Technical Analyst",
                "step": "technical_analysis",
                "message": "Calculating SMAs, RSI, MACD trendlines, and support/resistance ranges..."
            })
            yield format_sse("progress", {
                "agent": "Market News Analyst",
                "step": "news_analysis",
                "message": f"Scanning news sentiment from {len(news_raw)} articles..."
            })

            # Run LLM calls in parallel executors since they are synchronous requests inside agents
            async def run_fundamental():
                return await loop.run_in_executor(None, self.fundamental_agent.analyze, ticker, metadata, fundamentals_raw)

            async def run_technical():
                return await loop.run_in_executor(None, self.technical_agent.analyze, ticker, metadata, technicals_raw)

            async def run_news():
                return await loop.run_in_executor(None, self.news_agent.analyze, ticker, metadata, news_raw)

            # Await all three analysts
            fundamental_report, technical_report, news_report = await asyncio.gather(
                run_fundamental(),
                run_technical(),
                run_news(),
                return_exceptions=True
            )

            # Check for errors in parallel tasks
            if isinstance(fundamental_report, Exception):
                raise Exception(f"Fundamental Analysis failed: {fundamental_report}")
            if isinstance(technical_report, Exception):
                raise Exception(f"Technical Analysis failed: {technical_report}")
            if isinstance(news_report, Exception):
                raise Exception(f"News Analysis failed: {news_report}")

            yield format_sse("progress", {
                "agent": "System",
                "step": "analysts_complete",
                "message": "Analyst reports completed successfully. Delivering summaries to Risk Manager..."
            })
            await asyncio.sleep(0.5)

            # 3. Risk Assessment Run
            yield format_sse("progress", {
                "agent": "Risk Manager",
                "step": "risk_analysis",
                "message": f"Comparing volatility & balance sheet risk against user risk profile ({request.risk_tolerance})..."
            })

            risk_report = await loop.run_in_executor(
                None,
                self.risk_agent.analyze,
                ticker,
                metadata,
                user_params,
                technicals_raw,
                fundamental_report,
                technical_report,
                news_report
            )

            yield format_sse("progress", {
                "agent": "System",
                "step": "risk_complete",
                "message": f"Risk assessment finalized. Safety Rating: {risk_report.risk_rating}."
            })
            await asyncio.sleep(0.5)

            # 4. Final Recommendation (Portfolio Manager)
            yield format_sse("progress", {
                "agent": "Portfolio Manager",
                "step": "recommendation",
                "message": f"Weighing analyst views for {request.investment_horizon} horizon. Compiling Investment Memo..."
            })

            recommendation_report = await loop.run_in_executor(
                None,
                self.portfolio_agent.analyze,
                ticker,
                metadata,
                user_params,
                fundamental_report,
                technical_report,
                news_report,
                risk_report
            )

            # 5. Output Results
            yield format_sse("progress", {
                "agent": "System",
                "step": "finished",
                "message": "Investment Memo and recommendations successfully compiled!"
            })
            
            # Inject helper fields into analyst models for frontend visualization
            fundamental_report.ratios = fundamentals_raw.get("ratios", {})
            technical_report.current_price = technicals_raw.get("current_price", 0.0)
            technical_report.chart_data = technicals_raw.get("chart_data", [])
            
            result = CommitteeResult(
                request=request,
                fundamentals=fundamental_report,
                technicals=technical_report,
                news=news_report,
                risk=risk_report,
                recommendation=recommendation_report
            )
            
            yield format_sse("result", result.model_dump())
            
        except Exception as e:
            print(f"Orchestration Error: {e}")
            yield format_sse("error", {"message": f"An error occurred during committee deliberation: {str(e)}"})
