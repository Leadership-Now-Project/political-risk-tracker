'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Category, CategoryScore, DomainId, DomainScores, HistoricalSnapshot } from '@/lib/types';
import { getScoreColor, getRiskLevel } from '@/lib/risk-levels';
import { getDomainInfo } from '@/lib/scoring';
import RiskLevelBadge from './RiskLevelBadge';

interface CategoryListProps {
  categories: Category[];
  scores: Record<string, CategoryScore>;
  domainScores: DomainScores;
  historicalSnapshots: HistoricalSnapshot[];
  previousSnapshot: HistoricalSnapshot;
}

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  if (data.length < 2) return null;

  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pad = 3;

  const points = data.map((val, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((val - min) / range) * (h - pad * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
  const gradId = `sg-${id}`;

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="text-xs font-medium text-navy/30 dark:text-cream/30 w-10 text-center">
        --
      </span>
    );
  }
  const isUp = delta > 0;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-md w-10 text-center ${
      isUp
        ? 'bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400'
        : 'bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400'
    }`}>
      {isUp ? '+' : ''}{delta}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: string }) {
  const config = {
    increasing: { icon: '↑', color: 'text-red-500 dark:text-red-400', label: 'Rising' },
    decreasing: { icon: '↓', color: 'text-green-500 dark:text-green-400', label: 'Falling' },
    stable: { icon: '→', color: 'text-navy/30 dark:text-cream/30', label: 'Stable' },
  };
  const { icon, color } = config[trend as keyof typeof config] || config.stable;
  return <span className={`text-sm font-medium ${color}`}>{icon}</span>;
}

export default function CategoryList({
  categories,
  scores,
  domainScores,
  historicalSnapshots,
  previousSnapshot,
}: CategoryListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const domains: DomainId[] = ['rule-of-law', 'operating-economic', 'societal-institutional'];

  // Build sparkline data: all snapshots + current score for each category
  const getSparklineData = (categoryId: string): number[] => {
    const points = historicalSnapshots.map(s => s.scores[categoryId] ?? 0);
    points.push(scores[categoryId]?.score ?? 0);
    return points;
  };

  return (
    <div className="space-y-4">
      {domains.map((domainId) => {
        const domainInfo = getDomainInfo(domainId);
        const domainScore = domainScores[domainId];
        const domainColor = getScoreColor(domainScore);
        const domainCats = categories.filter(c => c.domain === domainId);

        return (
          <div key={domainId} id={`domain-${domainId}`} className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 dark:border-navy-400 overflow-hidden scroll-mt-20">
            {/* Domain header */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `2px solid ${domainColor}20` }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ backgroundColor: domainColor }}
                />
                <h3 className="text-xs font-bold text-navy/60 dark:text-cream/60 uppercase tracking-wider">
                  {domainInfo.name}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: domainColor }}
                >
                  {domainScore.toFixed(1)}
                </span>
                <RiskLevelBadge level={getRiskLevel(domainScore)} size="sm" />
              </div>
            </div>

            {/* Category rows */}
            {domainCats.map((cat) => {
              const catScore = scores[cat.id];
              if (!catScore) return null;
              const color = getScoreColor(catScore.score);
              const prevScore = previousSnapshot.scores[cat.id] ?? catScore.score;
              const delta = catScore.score - prevScore;
              const sparkData = getSparklineData(cat.id);
              const isExpanded = expandedCategory === cat.id;

              return (
                <div key={cat.id} className="border-t border-navy/5 dark:border-cream/5">
                  {/* Clickable row */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-navy/[0.04] dark:hover:bg-cream/[0.04] transition-colors group relative"
                  >
                    {/* Colored left accent */}
                    <div
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: color }}
                    />

                    {/* Category name + description */}
                    <div className="flex-1 min-w-0 pl-1">
                      <span className="text-sm font-medium text-navy dark:text-cream group-hover:text-gold transition-colors truncate block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-navy/40 dark:text-cream/40 truncate block leading-tight">
                        {cat.description}
                      </span>
                    </div>

                    {/* Sparkline */}
                    <div className="hidden sm:block">
                      <Sparkline data={sparkData} color={color} id={cat.id} />
                    </div>

                    {/* Score pill */}
                    <div
                      className="flex items-center justify-center w-10 h-7 rounded-md text-sm font-bold tabular-nums text-white"
                      style={{ backgroundColor: color }}
                    >
                      {catScore.score}
                    </div>

                    {/* Trend */}
                    <TrendIndicator trend={catScore.trend} />

                    {/* Delta */}
                    <DeltaBadge delta={delta} />

                    {/* Expand/collapse chevron */}
                    <svg
                      className={`w-4 h-4 text-navy/15 dark:text-cream/15 group-hover:text-gold transition-all flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Expanded findings panel */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 bg-navy/[0.02] dark:bg-cream/[0.02] border-t border-navy/5 dark:border-cream/5">
                      <div className="pl-2">
                        {/* Key Findings */}
                        <h4 className="text-xs font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider mb-2">
                          Key Findings
                        </h4>
                        <ul className="space-y-2 mb-4">
                          {catScore.keyFindings.map((finding, j) => (
                            <li key={j} className="text-sm text-navy/70 dark:text-cream/70 flex items-start gap-2 leading-relaxed">
                              <span className="text-gold font-bold flex-shrink-0">{j + 1}.</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>

                        {/* View full details link */}
                        <Link
                          href={`/category/${cat.id}`}
                          className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-dark transition-colors font-medium"
                        >
                          View full details
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
