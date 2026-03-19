'use client';

import { RiskLevel, HistoricalSnapshot } from '@/lib/types';
import { getScoreColor } from '@/lib/risk-levels';
import RiskLevelBadge from './RiskLevelBadge';

interface OverallScoreProps {
  score: number;
  riskLevel: RiskLevel;
  assessmentDate: string;
  assessmentPeriod: string;
  previousScore?: number;
  summary?: string;
  keyDevelopments?: string[];
  historicalSnapshots?: HistoricalSnapshot[];
}

function TrendSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const min = Math.min(...data) - 1;
  const max = Math.max(...data) + 1;
  const range = max - min || 1;
  const w = 280;
  const h = 90;
  const pad = 4;

  const points = data.map((val, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((val - min) / range) * (h - pad * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${h - pad} L${points[0].x},${h - pad} Z`;

  const first = data[0];
  const last = data[data.length - 1];
  const startPt = points[0];
  const endPt = points[points.length - 1];

  return (
    <div className="relative">
      <p className="text-xs font-medium text-gold/60 uppercase tracking-wider mb-1.5 text-right">
        Trend (12 months)
      </p>
      <svg width={w} height={h} className="overflow-visible">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area */}
        <path d={areaPath} fill="url(#sparkGrad)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Start dot */}
        <circle cx={startPt.x} cy={startPt.y} r="3.5" fill="white" opacity="0.85" />
        {/* Start label */}
        <text x={startPt.x} y={startPt.y - 8} textAnchor="start" fontSize="10" fontWeight="600" fill="white" opacity="0.75">
          {first.toFixed(1)}
        </text>
        {/* End dot with glow */}
        <circle cx={endPt.x} cy={endPt.y} r="8" fill="white" opacity="0.1" />
        <circle cx={endPt.x} cy={endPt.y} r="4.5" fill="white" opacity="0.95" />
        {/* End label */}
        <text x={endPt.x} y={endPt.y - 10} textAnchor="end" fontSize="10" fontWeight="600" fill="white" opacity="0.9">
          {last.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}

export default function OverallScore({
  score,
  riskLevel,
  assessmentDate,
  assessmentPeriod,
  previousScore,
  summary,
  keyDevelopments = [],
  historicalSnapshots = [],
}: OverallScoreProps) {
  const scoreColor = getScoreColor(score);
  const delta = previousScore != null ? score - previousScore : null;
  const percentage = (score / 10) * 100;

  const sparklineData = [
    ...historicalSnapshots.map(s => s.overallScore),
    score,
  ];

  return (
    <div className="bg-navy rounded-xl shadow-ln-heavy overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: Gauge + Score Info */}
          <div className="flex items-center gap-6">
            {/* Arc gauge (compact) */}
            <div className="relative flex-shrink-0">
              <svg width="100" height="58" viewBox="0 0 140 80" className="overflow-visible">
                {/* Background arc */}
                <path
                  d="M 10 70 A 60 60 0 0 1 130 70"
                  fill="none"
                  stroke="#1a3358"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Score arc */}
                <path
                  d="M 10 70 A 60 60 0 0 1 130 70"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * 190} 190`}
                  style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                />
                {/* Score */}
                <text x="70" y="64" textAnchor="middle" fontSize="28" fontWeight="bold" fill={scoreColor}>
                  {score.toFixed(1)}
                </text>
                <text x="12" y="82" textAnchor="start" fontSize="9" fill="#BDAA77">1</text>
                <text x="128" y="82" textAnchor="end" fontSize="9" fill="#BDAA77">10</text>
              </svg>
            </div>

            {/* Score info */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Overall Risk Score
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <RiskLevelBadge level={riskLevel} size="lg" />
                {delta != null && delta !== 0 && (
                  <span className={`text-sm font-semibold px-2.5 py-1 rounded-md ${
                    delta > 0
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)} from last
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sparkline + metadata */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            {sparklineData.length > 1 && (
              <TrendSparkline data={sparklineData} color={scoreColor} />
            )}
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-gold-light uppercase tracking-wider">Assessed </span>
                <span className="text-white font-medium">{assessmentDate}</span>
              </div>
              <div className="w-px h-3 bg-navy-400" />
              <div>
                <span className="text-gold-light uppercase tracking-wider">Period </span>
                <span className="text-cream/70">{assessmentPeriod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {(summary || keyDevelopments.length > 0) && (
        <div className="px-6 md:px-8 py-4 bg-navy-700/50 border-t border-navy-400">
          {summary && <p className="text-sm text-cream/60 leading-relaxed">{summary}</p>}
          {keyDevelopments.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {keyDevelopments.map((dev, i) => (
                <li key={i} className="text-xs text-cream/50 flex items-start gap-2 leading-relaxed">
                  <span className="text-gold mt-0.5 flex-shrink-0">•</span>
                  <span>{dev}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
