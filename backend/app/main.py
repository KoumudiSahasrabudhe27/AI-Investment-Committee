import uvicorn
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.config import config
from app.schemas import UserAnalysisRequest
from app.data.yfinance_client import get_ticker_metadata
from app.services.orchestrator import CommitteeOrchestrator

app = FastAPI(
    title="AI Investment Committee API",
    description="Multi-agent investment analysis backend powered by Google Gemini",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Enable all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = CommitteeOrchestrator()

@app.get("/api/health")
def health_check():
    """
    Standard service health check.
    """
    return {"status": "healthy", "service": "AI Investment Committee"}

@app.get("/api/ticker-info")
def get_ticker_info(ticker: str = Query(..., description="Stock ticker symbol, e.g. MSFT")):
    """
    Fetches basic ticker information to validate existence and get metadata.
    """
    ticker_clean = ticker.strip().upper()
    if not ticker_clean:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")
        
    metadata = get_ticker_metadata(ticker_clean)
    
    # If name equals the symbol and price is 0, ticker is likely invalid
    if metadata.get("name") == ticker_clean and metadata.get("current_price") == 0.0:
        raise HTTPException(status_code=404, detail=f"Stock ticker symbol '{ticker_clean}' could not be resolved.")
        
    return metadata

@app.post("/api/analyze")
async def analyze_stock(request: UserAnalysisRequest):
    """
    Submits a stock for full multi-agent committee review.
    Streams progress details and the final recommendation memo as Server-Sent Events (SSE).
    """
    # Quick uppercase validation
    request.ticker = request.ticker.strip().upper()
    if not request.ticker:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")
        
    # Return StreamingResponse with SSE headers
    return StreamingResponse(
        orchestrator.run_analysis_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
