'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CurrentAssessment, HistoricalChangesData, CategoriesData } from '@/lib/types';
import { getScoreColor, getRiskLevel } from '@/lib/risk-levels';
import { categoryNames } from '@/lib/category-names';

interface ThreatBriefingProps {
  currentData: CurrentAssessment;
  historicalChanges: HistoricalChangesData;
  categoriesData: CategoriesData;
}

export default function ThreatBriefing({
  currentData,
  historicalChanges,
  categoriesData,
}: ThreatBriefingProps) {
  const latest = historicalChanges.changes[historicalChanges.changes.length - 1];

  // Categories at critical levels (9-10)
  const criticalCategories = Object.entries(currentData.scores)
    .filter(([, data]) => data.score >= 9)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([id, data]) => {
      const cat = categoriesData.categories.find(c => c.id === id);
      return {
        id,
        name: categoryNames[id] || cat?.name || id,
        score: data.score,
        finding: data.keyFindings[0] || '',
        trend: data.trend,
      };
    });

  const [trajectoryOpen, setTrajectoryOpen] = useState(false);
  const riskLevel = currentData.riskLevel;
  const overallScore = currentData.overallScore;

  // Build trajectory milestones from historical data
  const changes = historicalChanges.changes;
  const baseline = changes[0];
  const totalRise = baseline ? overallScore - baseline.overallScore : 0;

  // Build a plain-language headline
  const headline = overallScore >= 9
    ? `The US political risk environment is at Severe levels (${overallScore}/10), with ${criticalCategories.length} categories at crisis thresholds.`
    : overallScore >= 7
    ? `The US political risk environment remains at ${riskLevel} levels (${overallScore}/10), with ${criticalCategories.length} categories at or near crisis thresholds.`
    : `The US political risk environment is at ${riskLevel} levels (${overallScore}/10).`;

  return (
    <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 dark:border-navy-400 overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-navy/5 to-transparent dark:from-cream/5">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-sm font-bold text-navy/60 dark:text-cream/60 uppercase tracking-wider">
            Threat Environment Briefing
          </h2>
          <span className="text-xs text-navy/40 dark:text-cream/40 ml-auto">
            {currentData.assessmentDate}
          </span>
        </div>
        <p className="text-base font-medium text-navy dark:text-cream leading-relaxed">
          {headline}
        </p>
      </div>

      {/* Critical categories */}
      {criticalCategories.length > 0 && (
        <div className="px-6 py-4 border-t border-navy/5 dark:border-cream/5">
          <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">
            Critical Risk Areas (Score 9-10)
          </h3>
          <div className="space-y-3">
            {criticalCategories.map(cat => {
              const color = getScoreColor(cat.score);
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="flex items-start gap-3 group"
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ backgroundColor: color }}
                  >
                    {cat.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-navy dark:text-cream group-hover:text-gold transition-colors">
                      {cat.name}
                    </span>
                    <p className="text-xs text-navy/55 dark:text-cream/55 leading-relaxed mt-0.5 line-clamp-2">
                      {cat.finding.replace(/\s*\([^)]*\)\s*$/, '')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Key developments */}
      {latest?.keyDevelopments && latest.keyDevelopments.length > 0 && (
        <div className="px-6 py-4 border-t border-navy/5 dark:border-cream/5 bg-navy/[0.02] dark:bg-cream/[0.02]">
          <h3 className="text-xs font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider mb-2">
            Key Developments This Period
          </h3>
          <ul className="space-y-1.5">
            {latest.keyDevelopments.map((dev, i) => (
              <li key={i} className="text-sm text-navy/70 dark:text-cream/70 flex items-start gap-2 leading-relaxed">
                <span className="text-gold mt-0.5 flex-shrink-0">•</span>
                <span>{dev}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* How We Got Here — trajectory from baseline to current */}
      {baseline && totalRise > 0 && (
        <div className="border-t border-navy/5 dark:border-cream/5">
          <button
            onClick={() => setTrajectoryOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-navy/[0.02] dark:hover:bg-cream/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider">
                How We Got Here
              </h3>
              <span className="text-xs text-navy/40 dark:text-cream/40">
                {baseline.overallScore} → {overallScore} since {baseline.period}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-navy/30 dark:text-cream/30 transition-transform ${trajectoryOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {trajectoryOpen && (
            <div className="px-6 pb-5">
              {/* Mini score bar showing trajectory */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 rounded-full bg-navy/5 dark:bg-cream/5 relative overflow-hidden">
                  {changes.filter(c => c.overallScore != null).map((c, i) => {
                    const pos = ((c.overallScore - 1) / 9) * 100;
                    const color = getScoreColor(c.overallScore);
                    return (
                      <div
                        key={i}
                        className="absolute top-0 h-full w-1.5 rounded-full"
                        style={{ left: `${pos}%`, backgroundColor: color, opacity: i === changes.length - 1 ? 1 : 0.4 }}
                        title={`${c.period}: ${c.overallScore}`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-navy/40 dark:text-cream/40 flex-shrink-0 tabular-nums">
                  +{totalRise.toFixed(1)}
                </span>
              </div>

              {/* Timeline of key escalation moments */}
              <div className="space-y-0">
                {changes.map((change, i) => {
                  // Skip methodology-only entries with no category changes and negative overall change
                  const isSubstantive = change.categoryChanges.length > 0 || change.overallChange === null;
                  if (!isSubstantive) return null;

                  const color = getScoreColor(change.overallScore);
                  const level = getRiskLevel(change.overallScore);
                  const isLast = i === changes.length - 1;
                  const isFirst = i === 0;
                  const isMajor = (change.overallChange ?? 0) >= 0.5 || isFirst || isLast;

                  return (
                    <div key={change.date} className="relative pl-7 pb-3 last:pb-0">
                      {/* Timeline line */}
                      {!isLast && (
                        <div className="absolute left-[8px] top-3 bottom-0 w-px bg-navy/10 dark:bg-cream/10" />
                      )}
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 top-1 rounded-full border-2 ${isMajor ? 'w-[17px] h-[17px]' : 'w-[13px] h-[13px] ml-0.5'}`}
                        style={{ backgroundColor: color, borderColor: color }}
                      />
                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-navy dark:text-cream ${isMajor ? 'text-sm' : 'text-xs'}`}>
                            {change.period}
                          </span>
                          <span
                            className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded"
                            style={{ color, backgroundColor: `${color}15` }}
                          >
                            {change.overallScore.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-medium" style={{ color }}>{level}</span>
                          {change.overallChange != null && change.overallChange !== 0 && (
                            <span className={`text-[10px] font-bold ${change.overallChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {change.overallChange > 0 ? '+' : ''}{change.overallChange.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-navy/55 dark:text-cream/55 leading-relaxed mt-0.5">
                          {change.summary}
                        </p>
                        {isMajor && change.categoryChanges.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {change.categoryChanges.slice(0, 4).map(cc => (
                              <span
                                key={cc.category}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-navy/5 dark:bg-cream/5 text-navy/50 dark:text-cream/50"
                              >
                                {categoryNames[cc.category] || cc.category} {cc.from}→{cc.to}
                              </span>
                            ))}
                            {change.categoryChanges.length > 4 && (
                              <span className="text-[10px] text-navy/30 dark:text-cream/30">
                                +{change.categoryChanges.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/history"
                className="inline-flex items-center gap-1 mt-3 text-sm text-gold hover:text-gold-dark transition-colors font-medium"
              >
                View full historical analysis →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
