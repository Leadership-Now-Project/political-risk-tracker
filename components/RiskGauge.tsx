'use client';

import { getScoreColor } from '@/lib/risk-levels';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function RiskGauge({ score, size = 'md', showLabel = true }: RiskGaugeProps) {
  const color = getScoreColor(score);
  const percentage = (score / 10) * 100;

  const dimensions = {
    sm: { width: 60, height: 35, strokeWidth: 6, fontSize: 12 },
    md: { width: 100, height: 55, strokeWidth: 8, fontSize: 18 },
    lg: { width: 140, height: 75, strokeWidth: 10, fontSize: 24 },
  };

  const { width, height, strokeWidth, fontSize } = dimensions[size];
  const radius = width / 2 - strokeWidth;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${strokeWidth} ${height} A ${radius} ${radius} 0 0 1 ${width - strokeWidth} ${height}`}
          fill="none"
          stroke="#D1D7E1"
          strokeWidth={strokeWidth}
        />
        {/* Colored arc */}
        <path
          d={`M ${strokeWidth} ${height} A ${radius} ${radius} 0 0 1 ${width - strokeWidth} ${height}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
        {/* Score text */}
        {showLabel && (
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="bold"
            fill={color}
          >
            {score.toFixed(1)}
          </text>
        )}
      </svg>
    </div>
  );
}
