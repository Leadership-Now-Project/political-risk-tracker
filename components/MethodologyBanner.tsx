'use client';

import { useState, useEffect } from 'react';
import { getScoreColor } from '@/lib/risk-levels';

const STORAGE_KEY = 'prt-methodology-dismissed';

const riskTiers = [
  { label: 'Low', range: '1-2.9', score: 2 },
  { label: 'Moderate', range: '3-4.9', score: 4 },
  { label: 'Elevated', range: '5-6.9', score: 6 },
  { label: 'High', range: '7-8.9', score: 8 },
  { label: 'Severe', range: '9-10', score: 10 },
];

export default function MethodologyBanner() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setDismissed(stored === 'true');
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (dismissed) return null;

  return (
    <div className="bg-gold/10 dark:bg-gold/5 border border-gold/20 rounded-lg px-5 py-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-navy/30 dark:text-cream/30 hover:text-navy dark:hover:text-cream transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 className="text-sm font-semibold text-navy dark:text-cream mb-1.5">
        How to Read This Assessment
      </h3>
      <p className="text-xs text-navy/60 dark:text-cream/60 leading-relaxed mb-3 max-w-3xl">
        This tracker monitors 11 risk categories across 3 domains, each scored 1-10 where higher means greater risk.
        Scores are updated weekly based on primary sources, verified reporting, and expert analysis.
        Categories are grouped into Rule of Law &amp; National Security, Operating &amp; Economic Environment,
        and Societal &amp; Institutional Integrity.
      </p>

      <div className="flex flex-wrap gap-2">
        {riskTiers.map(tier => (
          <div
            key={tier.label}
            className="flex items-center gap-1.5 text-xs"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getScoreColor(tier.score) }}
            />
            <span className="text-navy/50 dark:text-cream/50">
              <span className="font-medium text-navy/70 dark:text-cream/70">{tier.label}</span>{' '}
              ({tier.range})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
