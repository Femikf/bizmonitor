import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export const ChartComponent: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '1y'>('30d');

  const chartData = {
    '7d': [
      { day: 'Mon', revenue: 4200, requests: 120000, latency: 38 },
      { day: 'Tue', revenue: 5100, requests: 145000, latency: 41 },
      { day: 'Wed', revenue: 4800, requests: 132000, latency: 39 },
      { day: 'Thu', revenue: 6300, requests: 178000, latency: 44 },
      { day: 'Fri', revenue: 7100, requests: 195000, latency: 42 },
      { day: 'Sat', revenue: 5900, requests: 160000, latency: 36 },
      { day: 'Sun', revenue: 6800, requests: 185000, latency: 37 },
    ],
    '30d': [
      { day: 'W1', revenue: 28000, requests: 850000, latency: 40 },
      { day: 'W2', revenue: 34000, requests: 990000, latency: 42 },
      { day: 'W3', revenue: 39000, requests: 1120000, latency: 39 },
      { day: 'W4', revenue: 45200, requests: 1350000, latency: 38 },
    ],
    '1y': [
      { day: 'Q1', revenue: 95000, requests: 2800000, latency: 45 },
      { day: 'Q2', revenue: 118000, requests: 3400000, latency: 41 },
      { day: 'Q3', revenue: 142000, requests: 4100000, latency: 39 },
      { day: 'Q4', revenue: 176000, requests: 5200000, latency: 37 },
    ],
  };

  const currentData = chartData[period];
  const maxRevenue = Math.max(...currentData.map(d => d.revenue));

  // Generate SVG polyline path coordinates
  const width = 600;
  const height = 180;
  const padding = 20;

  const points = currentData.map((d, index) => {
    const x = padding + (index / (currentData.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.revenue / maxRevenue) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '1.05rem' }}>Revenue & API Request Analytics</h3>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              <TrendingUp size={12} /> +18.4% vs last period
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Real-time telemetry and financial volume aggregated across global nodes
          </p>
        </div>

        {/* Period Selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 'var(--radius-sm)' }}>
          {(['7d', '30d', '1y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="btn"
              style={{
                padding: '4px 12px',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-sm)',
                background: period === p ? 'var(--accent-primary)' : 'transparent',
                color: period === p ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minHeight: 200 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={height * ratio}
              x2={width - padding}
              y2={height * ratio}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#chartGradient)" />

          {/* Line path */}
          <polyline
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points */}
          {currentData.map((d, index) => {
            const x = padding + (index / (currentData.length - 1)) * (width - 2 * padding);
            const y = height - padding - (d.revenue / maxRevenue) * (height - 2 * padding);
            return (
              <g key={index} className="chart-point">
                <circle cx={x} cy={y} r="5" fill="#111827" stroke="#8b5cf6" strokeWidth="3" />
                <text
                  x={x}
                  y={height - 2}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Avg Revenue: </span>
          <strong style={{ color: 'var(--text-primary)' }}>
            ${(currentData.reduce((acc, curr) => acc + curr.revenue, 0) / currentData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Total Requests: </span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {(currentData.reduce((acc, curr) => acc + curr.requests, 0) / 1000000).toFixed(2)}M
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Avg Latency: </span>
          <strong style={{ color: 'var(--accent-emerald)' }}>39.2ms</strong>
        </div>
      </div>
    </div>
  );
};
