'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CategoriesData, CurrentAssessment, StatesData, ActionsPushbackData, HistoricalSnapshot, HistoricalChangesData, DomainId } from '@/lib/types';
import { getScoreColor, getRiskLevel } from '@/lib/risk-levels';
import { getDomainInfo } from '@/lib/scoring';
import OverallScore from '@/components/OverallScore';
import RiskViewToggle from '@/components/RiskViewToggle';
import CategoryList from '@/components/CategoryList';
import USHeatmap from '@/components/USHeatmap';
import Spotlight from '@/components/Spotlight';
import PageNav from '@/components/PageNav';

interface DashboardProps {
  categoriesData: CategoriesData;
  currentData: CurrentAssessment;
  statesData: StatesData;
  actionsPushbackData?: ActionsPushbackData;
  previousSnapshot: HistoricalSnapshot;
  historicalChanges: HistoricalChangesData;
  historicalSnapshots: HistoricalSnapshot[];
}

export default function Dashboard({
  categoriesData,
  currentData,
  statesData,
  actionsPushbackData,
  previousSnapshot,
  historicalChanges,
  historicalSnapshots,
}: DashboardProps) {
  const [view, setView] = useState<'national' | 'state'>('national');

  const { categories } = categoriesData;

  const latestChangeSummary = useMemo(() => {
    const latest = historicalChanges.changes[historicalChanges.changes.length - 1];
    return latest?.summary || '';
  }, [historicalChanges]);

  const pageSections = useMemo(() => {
    const base = [
      { id: 'overall-score', label: 'Overview' },
      { id: 'spotlight', label: 'Top Risks' },
      { id: 'categories', label: view === 'national' ? 'Categories' : 'State Map' },
    ];
    if (actionsPushbackData) {
      base.push({ id: 'actions', label: 'Actions' });
    }
    return base;
  }, [view, actionsPushbackData]);

  return (
    <>
      <PageNav sections={pageSections} />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream">
            US Political Risk Assessment
          </h1>
          <p className="mt-1 text-sm text-navy/50 dark:text-cream/50">
            Tracking democratic health across 10 key indicators
          </p>
        </div>

        {/* Overall Score */}
        <div id="overall-score" className="scroll-mt-20">
          <OverallScore
            score={currentData.overallScore}
            riskLevel={currentData.riskLevel}
            assessmentDate={currentData.assessmentDate}
            assessmentPeriod={currentData.assessmentPeriod}
            previousScore={previousSnapshot.overallScore}
            summary={latestChangeSummary}
            historicalSnapshots={historicalSnapshots}
          />
        </div>

        {/* Spotlight: Top Risk Areas */}
        <div id="spotlight" className="scroll-mt-20">
          <Spotlight currentData={currentData} />
        </div>

        {/* Domain Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['rule-of-law', 'operating-economic', 'societal-institutional'] as DomainId[]).map((domainId) => {
            const domainScore = currentData.domainScores[domainId];
            const color = getScoreColor(domainScore);
            const level = getRiskLevel(domainScore);
            const info = getDomainInfo(domainId);

            return (
              <div
                key={domainId}
                className="bg-white dark:bg-navy-600 rounded-lg border border-navy/10 dark:border-cream/10 px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-navy/60 dark:text-cream/60 uppercase tracking-wider block">
                      {info.name}
                    </span>
                    <span className="text-[10px] text-navy/30 dark:text-cream/30">{level}</span>
                  </div>
                </div>
                <span
                  className="text-xl font-black tabular-nums"
                  style={{ color }}
                >
                  {domainScore.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className="flex justify-center">
          <RiskViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Category List or State Map */}
        <div id="categories" className="scroll-mt-20">
          {view === 'national' ? (
            <CategoryList
              categories={categories}
              scores={currentData.scores}
              domainScores={currentData.domainScores}
              historicalSnapshots={historicalSnapshots}
              previousSnapshot={previousSnapshot}
            />
          ) : (
            <USHeatmap states={statesData.states} />
          )}
        </div>

        {/* Actions & Pushback — compact bar */}
        {actionsPushbackData && (
          <div id="actions" className="scroll-mt-20">
            <Link
              href="/actions-pushback"
              className="flex items-center justify-between px-5 py-3.5 rounded-lg bg-white dark:bg-navy-600 border border-navy/10 dark:border-cream/10 hover:shadow-ln-medium hover:border-gold/30 transition-all group"
            >
              <div className="flex items-center gap-6 text-sm">
                <span className="font-semibold text-navy dark:text-cream group-hover:text-gold transition-colors">
                  Actions & Pushback
                </span>
                <span className="text-navy/50 dark:text-cream/50">
                  <span className="font-bold text-navy dark:text-cream">{actionsPushbackData.summary.totalActions}</span> actions
                </span>
                <span className="text-navy/50 dark:text-cream/50">
                  <span className="font-bold text-red-600 dark:text-red-400">{actionsPushbackData.summary.blockedOrReversed}</span> blocked
                </span>
                <span className="text-navy/50 dark:text-cream/50">
                  <span className="font-bold text-green-600 dark:text-green-400">{Math.round(actionsPushbackData.summary.implementationRate * 100)}%</span> implemented
                </span>
              </div>
              <svg className="w-4 h-4 text-navy/20 dark:text-cream/20 group-hover:text-gold transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
