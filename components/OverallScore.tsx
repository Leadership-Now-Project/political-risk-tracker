'use client';

import { RiskLevel } from '@/lib/types';
import { getScoreColor } from '@/lib/risk-levels';
import RiskLevelBadge from './RiskLevelBadge';

interface OverallScoreProps {
  score: number;
  riskLevel: RiskLevel;
  assessmentDate: string;
  assessmentPeriod: string;
}

export default function OverallScore({
  score,
  riskLevel,
  assessmentDate,
  assessmentPeriod,
}: OverallScoreProps) {
  const scoreColor = getScoreColor(score);
  const percentage = (score / 10) * 100;

  return (
    <div className="bg-navy rounded-xl shadow-ln-heavy p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Score Display */}
        <div className="flex items-center gap-6">
          {/* Large Gauge */}
          <div className="relative">
            <svg width="160" height="90" viewBox="0 0 160 90" className="overflow-visible">
              {/* Background arc */}
              <path
                d="M 10 80 A 70 70 0 0 1 150 80"
                fill="none"
                stroke="#475F87"
                strokeWidth="12"
              />
              {/* Colored arc */}
              <path
                d="M 10 80 A 70 70 0 0 1 150 80"
                fill="none"
                stroke={scoreColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 220} 220`}
                style={{
                  transition: 'stroke-dasharray 0.5s ease-in-out',
                }}
              />
              {/* Score text */}
              <text
                x="80"
                y="70"
                textAnchor="middle"
                fontSize="36"
                fontWeight="bold"
                fill={scoreColor}
              >
                {score.toFixed(1)}
              </text>
              {/* Scale labels */}
              <text x="10" y="95" textAnchor="middle" fontSize="10" fill="#BDAA77">
                1
              </text>
              <text x="150" y="95" textAnchor="middle" fontSize="10" fill="#BDAA77">
                10
              </text>
            </svg>
          </div>

          {/* Score Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Overall Risk Score
            </h1>
            <div className="mt-2">
              <RiskLevelBadge level={riskLevel} size="lg" />
            </div>
          </div>
        </div>

        {/* Assessment Info */}
        <div className="text-center md:text-right">
          <p className="text-sm text-gold-light uppercase tracking-wider">Assessment Date</p>
          <p className="text-lg font-semibold text-white">{assessmentDate}</p>
          <p className="text-sm text-gold-light uppercase tracking-wider mt-3">Period Covered</p>
          <p className="text-sm text-cream">{assessmentPeriod}</p>
        </div>
      </div>

      {/* Risk Scale Legend */}
      <div className="mt-6 pt-6 border-t border-navy-400">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-risk-low"></div>
            <span className="text-xs text-cream/80">Low (1-2.9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-risk-moderate"></div>
            <span className="text-xs text-cream/80">Moderate (3-4.9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-risk-elevated"></div>
            <span className="text-xs text-cream/80">Elevated (5-6.9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-risk-high"></div>
            <span className="text-xs text-cream/80">High (7-8.9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-risk-severe"></div>
            <span className="text-xs text-cream/80">Severe (9-10)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
