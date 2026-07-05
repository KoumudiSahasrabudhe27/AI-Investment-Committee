# 💼AI Investment Committee

> A Multi-Agent AI System that simulates a professional investment committee to analyze stocks and generate comprehensive investment recommendations.

![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Gemini](https://img.shields.io/badge/LLM-Gemini%202.5%20Flash-4285F4)
![Python](https://img.shields.io/badge/Python-3.13-blue)

---

#  Problem Statement

Retail investors often rely on fragmented information spread across financial statements, technical indicators, and market news. Existing tools typically provide isolated metrics or a single AI response without structured reasoning.

Professional investment firms, however, use committees of specialists who independently evaluate different aspects of an investment before reaching a consensus.

This project recreates that workflow using AI Agents.

---

#  Solution

AI Investment Committee is a multi-agent system that simulates an investment committee using specialized AI agents.

A user enters a stock ticker and investment profile.

The system gathers live financial data, technical indicators, and recent news before distributing the information to independent AI agents.

Each agent performs a specialized analysis and the Portfolio Manager combines every opinion into a final investment recommendation.

---

#  Features

-  Fundamental Analysis Agent
-  Technical Analysis Agent
-  Market News & Sentiment Agent
-  Risk Assessment Agent
-  Portfolio Manager Agent
-  Live Progress Streaming (Server-Sent Events)
-  Interactive Technical Charts
-  Executive Investment Memo
-  Personalized Recommendations based on Risk Profile

---

#  Architecture

```
                        User
                          │
                          ▼
                 React + TypeScript
              Investment Dashboard
                          │
             Server Sent Events (SSE)
                          │
                          ▼
                 FastAPI Backend
                          │
                          ▼
             Committee Orchestrator
                          │
      ┌──────────┬──────────┬──────────┬──────────┬──────────┐
      ▼          ▼          ▼          ▼          ▼
Fundamental  Technical   Market     Risk      Portfolio
  Agent        Agent      News      Manager     Manager
                          Agent
      └──────────┴──────────┴──────────┴──────────┘
                          │
                          ▼
                  Gemini 2.5 Flash API
                          │
                          ▼
               Final Investment Memo
```

---

#  Multi-Agent Workflow

##  Fundamental Analyst

Evaluates:

- Financial Statements
- Profitability
- Revenue Growth
- Balance Sheet
- Cash Flow
- Valuation Multiples

Produces:

- Fundamental Score
- Bull Points
- Bear Points
- Valuation Assessment

---

## Technical Analyst

Evaluates:

- SMA 20 / 50 / 200
- RSI
- MACD
- ATR
- Support Levels
- Resistance Levels

Produces:

- Technical Trend
- Momentum Score
- Technical Report

---

##  Market News Analyst

Evaluates:

- Recent News
- Media Sentiment
- Business Catalysts
- Market Concerns

Produces:

- Sentiment Score
- Positive Catalysts
- Risk Factors

---

##  Risk Manager

Evaluates

- User Risk Tolerance
- Investment Horizon
- Market Risk
- Valuation Risk
- Portfolio Suitability

Produces

- Risk Rating
- Alignment Verdict
- Stop Loss Recommendation

---

##  Portfolio Manager

Combines every specialist opinion and produces

- BUY / HOLD / SELL Recommendation
- Confidence Score
- Investment Thesis
- Bull Case
- Bear Case
- Executive Summary

---

#  Tech Stack

## Frontend

- React
- TypeScript
- Vite
- CSS

## Backend

- FastAPI
- Python
- Pydantic

## AI

- Google Gemini 2.5 Flash

## Financial Data

- yFinance
- Finnhub API

---

#  Application Preview

The dashboard provides:

- Live Committee Progress
- Interactive Price Charts
- Individual Agent Opinions
- Risk Assessment
- Executive Investment Memo
- Final Recommendation

---

#  Local Setup

## Clone Repository

```bash
git clone https://github.com/KoumudiSahasrabudhe27/AI-Investment-Committee.git

cd AI-Investment-Committee
```

---

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Create

```
backend/.env
```

Add

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

FINNHUB_API_KEY=YOUR_FINNHUB_API_KEY
```

---

# 🎥 Demo

The application demonstrates:

- Live multi-agent collaboration
- Streaming analysis updates
- Financial reasoning
- Technical analysis
- News sentiment
- Risk assessment
- Final committee recommendation

---

# 📚 Concepts Demonstrated

This project demonstrates concepts from Google's **5-Day AI Agents: Intensive Vibe Coding Course**:

✅ Multi-Agent Architecture

✅ Agent Orchestration

✅ Structured LLM Outputs

✅ Server-Sent Events (Real-Time Streaming)

✅ Modular Agent Design

✅ Secure API Key Management

---

# 🔮 Future Improvements

- Portfolio Optimization
- Historical Backtesting
- Broker Integration
- Real-Time Market Streaming
- Watchlists
- Email Reports
- Multi-Currency Support

---

# 👩‍💻 Author

**Koumudi Sahasrabudhe**

GitHub:

https://github.com/KoumudiSahasrabudhe27

---

# 📄 License

This project was developed as part of the **Google × Kaggle – AI Agents: Intensive Vibe Coding Capstone Project**.
