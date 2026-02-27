'use client';

import Link from 'next/link';
import { CurrentAssessment, HistoricalSnapshot, HistoricalChangesData } from '@/lib/types';
import { getScoreColor } from '@/lib/risk-levels';

interface KeyTakeawaysProps {
  current: CurrentAssessment;
  previousSnapshot: HistoricalSnapshot;
  historicalChanges: HistoricalChangesData;
}

interface TakeawayItem {
  categoryId: string;
  categoryName: string;
  currentScore: number;
  previousScore: number;
  delta: number;
  rationale: string;
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

export default function KeyTakeaways({
  current,
  previousSnapshot,
  historicalChanges,
}: KeyTakeawaysProps) {
  const latestPeriod = historicalChanges.changes[historicalChanges.changes.length - 1];

  // Build takeaway items: find top 3 biggest absolute deltas
  const deltas: TakeawayItem[] = Object.entries(current.scores)
    .map(([catId, catScore]) => {
      const prevScore = previousSnapshot.scores[catId] ?? 0;
      const delta = catScore.score - prevScore;
      const change = latestPeriod?.categoryChanges.find(c => c.category === catId);
      return {
        categoryId: catId,
        categoryName: categoryNames[catId] || catId,
        currentScore: catScore.score,
        previousScore: prevScore,
        delta,
        rationale: change?.rationale ?? '',
      };
    })
    .filter(item => item.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  if (deltas.length === 0) return null;

  const overallDelta = current.overallScore - previousSnapshot.overallScore;

  return (
    <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-gold/30 p-6 bg-gradient-to-r from-gold/5 to-transparent">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className="text-lg font-semibold text-navy dark:text-cream">
            Key Changes Since Last Assessment
          </h2>
        </div>
        {overallDelta !== 0 && (
          <span className={`self-start sm:ml-auto text-sm font-medium px-2 py-0.5 rounded ${
            overallDelta > 0
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            Overall: {overallDelta > 0 ? '+' : ''}{overallDelta.toFixed(1)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {deltas.map(item => (
          <div key={item.categoryId} className="flex items-start gap-3">
            <div className={`flex-shrink-0 flex items-center gap-1 min-w-[60px] font-semibold text-sm ${
              item.delta > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              <span>{item.delta > 0 ? '↑' : '↓'}</span>
              <span>{item.delta > 0 ? '+' : ''}{item.delta}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/category/${item.categoryId}`}
                  className="font-medium text-navy dark:text-cream hover:text-gold transition-colors"
                >
                  {item.categoryName}
                </Link>
                <span className="text-xs text-navy/40 dark:text-cream/40">
                  {item.previousScore} →{' '}
                  <span style={{ color: getScoreColor(item.currentScore) }}>
                    {item.currentScore}
                  </span>
                </span>
              </div>
              {item.rationale && (
                <p className="text-sm text-navy/60 dark:text-cream/60 mt-0.5 line-clamp-2">
                  {item.rationale}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/history"
        className="inline-flex items-center gap-1 mt-4 text-sm text-gold hover:text-gold-dark transition-colors font-medium"
      >
        View full history →
      </Link>
    </div>
  );
}
