import React from "react";

interface ChartDataPoint {
  date: string;
  close: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
}

interface ValuationChartProps {
  chartData: ChartDataPoint[];
  ticker: string;
  currentPrice: number;
}

export const ValuationChart: React.FC<ValuationChartProps> = ({ chartData, ticker, currentPrice }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div style={{
        height: "220px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        fontSize: "0.875rem",
        border: "1px dashed var(--glass-border)",
        borderRadius: "8px"
      }}>
        No price historical chart data available.
      </div>
    );
  }

  // Dimensions
  const width = 600;
  const height = 240;
  const paddingLeft = 55;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Extract values to find limits
  const closes = chartData.map((d) => d.close);
  const smas = chartData.flatMap((d) => [d.sma20, d.sma50, d.sma200].filter((v): v is number => v !== undefined && v !== null));
  const allValues = [...closes, ...smas];

  const maxVal = Math.max(...allValues) * 1.02; // add 2% padding
  const minVal = Math.min(...allValues) * 0.98; // subtract 2% padding
  const valRange = maxVal - minVal;

  const getX = (index: number) => {
    return paddingLeft + (index / (chartData.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return height - paddingBottom - ((val - minVal) / valRange) * chartHeight;
  };

  // Generate path coordinates
  const pricePoints = chartData.map((d, i) => `${getX(i)},${getY(d.close)}`).join(" L ");
  const pricePathD = `M ${pricePoints}`;
  
  // Fill path (closes back down to bottom Y of chart area)
  const fillPathD = `${pricePathD} L ${getX(chartData.length - 1)},${height - paddingBottom} L ${getX(0)},${height - paddingBottom} Z`;

  // SMA paths
  const getSmaPath = (key: "sma20" | "sma50" | "sma200") => {
    const points = chartData
      .map((d, i) => {
        const val = d[key];
        return val ? `${getX(i)},${getY(val)}` : null;
      })
      .filter((p): p is string => p !== null);
      
    return points.length > 0 ? `M ${points.join(" L ")}` : "";
  };

  const sma20Path = getSmaPath("sma20");
  const sma50Path = getSmaPath("sma50");
  const sma200Path = getSmaPath("sma200");

  // Grid line values
  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks }).map((_, i) => {
    const val = minVal + (valRange / (yTicks - 1)) * i;
    return {
      val,
      y: getY(val)
    };
  });

  const xTicks = 4;
  const dateInterval = Math.floor(chartData.length / (xTicks - 1));
  const dateLines = Array.from({ length: xTicks }).map((_, i) => {
    const index = Math.min(i * dateInterval, chartData.length - 1);
    return {
      label: chartData[index].date.slice(5), // MM-DD format
      x: getX(index)
    };
  });

  // Calculate percentage return
  const startPrice = closes[0];
  const endPrice = closes[closes.length - 1];
  const percentChange = ((endPrice - startPrice) / startPrice) * 100;
  const isPositive = percentChange >= 0;

  return (
    <div className="glass-panel" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "bold" }}>
            {ticker} Technical Chart (100 Days)
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
            <h2 style={{ fontSize: "1.5rem" }}>${currentPrice.toFixed(2)}</h2>
            <span style={{
              fontSize: "0.85rem",
              fontWeight: "bold",
              color: isPositive ? "var(--color-success)" : "var(--color-danger)"
            }}>
              {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {/* Legends */}
        <div style={{ display: "flex", gap: "12px", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", backgroundColor: "var(--color-primary)", borderRadius: "50%" }} />
            Price
          </div>
          {sma20Path && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", backgroundColor: "var(--color-accent)", borderRadius: "50%" }} />
              SMA 20
            </div>
          )}
          {sma50Path && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", backgroundColor: "var(--color-warning)", borderRadius: "50%" }} />
              SMA 50
            </div>
          )}
        </div>
      </div>

      <div style={{ width: "100%", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Labels */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                textAnchor="end"
                fill="var(--text-muted)"
                style={{ fontSize: "10px", fontFamily: "monospace" }}
              >
                ${line.val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Date lines */}
          {dateLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={line.x}
                y1={paddingTop}
                x2={line.x}
                y2={height - paddingBottom}
                stroke="rgba(255, 255, 255, 0.02)"
                strokeWidth="1"
              />
              <text
                x={line.x}
                y={height - paddingBottom + 16}
                textAnchor="middle"
                fill="var(--text-muted)"
                style={{ fontSize: "10px", fontFamily: "monospace" }}
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Filled Area */}
          <path d={fillPathD} fill="url(#priceGlow)" />

          {/* SMA 200 */}
          {sma200Path && (
            <path d={sma200Path} fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" strokeDasharray="2,2" />
          )}

          {/* SMA 50 */}
          {sma50Path && (
            <path d={sma50Path} fill="none" stroke="var(--color-warning)" strokeWidth="1.2" strokeDasharray="4,2" />
          )}

          {/* SMA 20 */}
          {sma20Path && (
            <path d={sma20Path} fill="none" stroke="var(--color-accent)" strokeWidth="1.2" strokeDasharray="3,1" />
          )}

          {/* Stock Close Price Line */}
          <path d={pricePathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.2" />

          {/* Final closing dot indicator */}
          <circle
            cx={getX(chartData.length - 1)}
            cy={getY(closes[closes.length - 1])}
            r="4"
            fill="var(--color-primary)"
            stroke="var(--bg-primary)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
};
