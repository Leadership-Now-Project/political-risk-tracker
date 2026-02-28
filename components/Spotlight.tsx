'use client';

import Link from 'next/link';
import { CurrentAssessment } from '@/lib/types';
import { getScoreColor, getRiskLevel } from '@/lib/risk-levels';

interface SpotlightProps {
  currentData: CurrentAssessment;
}

const categoryNames: Record<string, string> = {
  'elections': 'Elections',
  'rule-of-law': 'Rule of Law',
  'national-security': 'National Security',
  'regulatory-stability': 'Regulatory Stability',
  'trade-policy': 'Trade Policy',
  'government-contracts': "Gov't Contracts",
  'fiscal-policy': 'Fiscal Policy',
  'media-freedom': 'Media Freedom',
  'civil-discourse': 'Civil Discourse',
  'institutional-integrity': 'Institutional Integrity',
};

export default function Spotlight({ currentData }: SpotlightProps) {
  // Get top 3 categories by score
  const topCategories = Object.entries(currentData.scores)
    .map(([id, data]) => ({
      id,
      name: categoryNames[id] || id,
      score: data.score,
      finding: data.keyFindings[0] || '',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div>
      <h2 className="text-sm font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider mb-3">
        Top Risk Areas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCategories.map((cat, i) => {
          const color = getScoreColor(cat.score);
          const level = getRiskLevel(cat.score);

          return (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group relative overflow-hidden rounded-xl border border-navy/10 dark:border-cream/10 hover:shadow-ln-heavy hover:border-navy/20 dark:hover:border-cream/20 transition-all"
            >
              {/* Colored top bar */}
              <div
                className="h-1"
                style={{ backgroundColor: color }}
              />

              {/* Card body */}
              <div className="bg-white dark:bg-navy-600 p-5">
                {/* Header with rank */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Rank circle */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-navy dark:text-cream group-hover:text-gold transition-colors block">
                        {cat.name}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color }}
                      >
                        {level}
                      </span>
                    </div>
                  </div>
                  {/* Score */}
                  <div className="flex flex-col items-center">
                    <span
                      className="text-2xl font-black tabular-nums leading-none"
                      style={{ color }}
                    >
                      {cat.score}
                    </span>
                    <span className="text-[10px] text-navy/30 dark:text-cream/30 mt-0.5">/10</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full h-1.5 rounded-full bg-navy/5 dark:bg-cream/5 mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(cat.score / 10) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>

                {/* Finding */}
                <p className="text-xs text-navy/60 dark:text-cream/60 leading-relaxed line-clamp-3">
                  {cat.finding.replace(/\s*\([^)]*\)\s*$/, '')}
                </p>

                {/* Footer arrow */}
                <div className="flex items-center justify-end mt-3 pt-2 border-t border-navy/5 dark:border-cream/5">
                  <span className="text-xs text-navy/30 dark:text-cream/30 group-hover:text-gold transition-colors mr-1">
                    Details
                  </span>
                  <svg className="w-3.5 h-3.5 text-navy/20 dark:text-cream/20 group-hover:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
