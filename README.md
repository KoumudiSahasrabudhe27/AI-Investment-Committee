# AI Investment Committee

A Kaggle capstone project showcasing a production-quality multi-agent AI system that simulates an investment committee to help retail investors make informed decisions.

Powered by **FastAPI (Backend)**, **React (Vite + TS Frontend)**, and **Google Gemini API** (`gemini-1.5-flash`).

## Project Features

- **Multi-Agent Deliberations**: Five specialized agents collaborate in real-time:
  1. **Fundamental Analyst**: Reviews income statements, balance sheets, and key ratios.
  2. **Technical Analyst**: Reads daily pricing trends, SMA indicators, RSI, and MACD.
  3. **Market News Analyst**: Analyzes recent company headlines, catalysts, and media sentiment.
  4. **Risk Manager (Adversarial Check)**: Examines volatility (beta, ATR) and evaluates suitability matching user risk tolerance.
  5. **Portfolio Manager (Chair)**: Synthesizes committee reports, handles conflict resolution, and writes the final Investment Memo.
- **Server-Sent Events (SSE)**: Streams live progress logs from the agents to the frontend in real-time.
- **Modern Dark-Mode Dashboard**: Sleek glassmorphic components, micro-animations, SVG charts, and interactive memos.

---

## Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- A Google Gemini API Key

---

### 2. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file and insert your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
4. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Run the FastAPI server:
   ```bash
   python -m app.main
   ```
   The backend will start on [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

### 3. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will start on [http://localhost:5173](http://localhost:5173).

---

## Codebase Architecture

```text
ai-investment-committee/
├── backend/
│   ├── app/
│   │   ├── main.py                # Server routes and configuration
│   │   ├── config.py              # Env loading
│   │   ├── schemas.py             # Pydantic typing
│   │   ├── data/
│   │   │   ├── finnhub_client.py  # Market news retriever
│   │   │   └── yfinance_client.py # Scraping prices, metrics, and financials
│   │   ├── agents/
│   │   │   ├── base.py            # Base agent with Gemini connector
│   │   │   ├── fundamental.py     # Solvency & valuation analysis
│   │   │   ├── technical.py       # Trend & momentum indicators
│   │   │   ├── market_news.py     # Sentiment analysis
│   │   │   ├── risk_manager.py    # Suitability checks & volatility stop-losses
│   │   │   └── portfolio_mgr.py   # Final memo composition & decision making
│   │   └── services/
│   │       └── orchestrator.py    # Committee flow coordinator
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/            # Visual dashboard panels
│   │   ├── hooks/                 # custom SSE streaming hook
│   │   ├── App.tsx                # Dashboard layout
│   │   ├── index.css              # Custom styling
│   │   └── types.ts               # TS schemas
│   └── package.json
└── README.md
```
