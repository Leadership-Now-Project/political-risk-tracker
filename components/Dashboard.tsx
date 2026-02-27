'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CategoriesData, CurrentAssessment, StatesData, DomainId, ActionsPushbackData, HistoricalSnapshot, HistoricalChangesData } from '@/lib/types';
import OverallScore from '@/components/OverallScore';
import RiskViewToggle from '@/components/RiskViewToggle';
import MekkoChart from '@/components/MekkoChart';
import USHeatmap from '@/components/USHeatmap';
import DomainSection from '@/components/DomainSection';
import PageNav from '@/components/PageNav';
import KeyTakeaways from '@/components/KeyTakeaways';

interface DashboardProps {
  categoriesData: CategoriesData;
  currentData: CurrentAssessment;
  statesData: StatesData;
  actionsPushbackData?: ActionsPushbackData;
  previousSnapshot: HistoricalSnapshot;
  historicalChanges: HistoricalChangesData;
}

export default function Dashboard({ categoriesData, currentData, statesData, actionsPushbackData, previousSnapshot, historicalChanges }: DashboardProps) {
  const [view, setView] = useState<'national' | 'state'>('national');

  const { categories } = categoriesData;
  const domains: DomainId[] = ['rule-of-law', 'operating-economic', 'societal-institutional'];

  const pageSections = useMemo(() => {
    const base = [
      { id: 'overall-score', label: 'Overall Score' },
      { id: 'key-takeaways', label: 'Key Changes' },
      { id: 'visualization', label: view === 'national' ? 'Risk Chart' : 'State Map' },
    ];
    if (view === 'national') {
      return [
        ...base,
        { id: 'rule-of-law', label: 'Rule of Law' },
        { id: 'operating-economic', label: 'Economic' },
        { id: 'societal-institutional', label: 'Societal' },
        { id: 'about', label: 'About' },
      ];
    }
    return [...base, { id: 'about', label: 'About' }];
  }, [view]);

  return (
    <>
      <PageNav sections={pageSections} />
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream">
            US Political Risk Assessment
          </h1>
          <p className="mt-2 text-navy/70 dark:text-cream/70">
            Tracking democratic health across 10 key indicators
          </p>
        </div>

        {/* Overall Score Card */}
        <div id="overall-score" className="scroll-mt-20">
          <OverallScore
            score={currentData.overallScore}
            riskLevel={currentData.riskLevel}
            assessmentDate={currentData.assessmentDate}
            assessmentPeriod={currentData.assessmentPeriod}
          />
        </div>

        {/* Key Takeaways */}
        <div id="key-takeaways" className="scroll-mt-20">
          <KeyTakeaways
            current={currentData}
            previousSnapshot={previousSnapshot}
            historicalChanges={historicalChanges}
          />
        </div>

        {/* View Toggle */}
        <div className="flex justify-center">
          <RiskViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Conditional View */}
        {view === 'national' ? (
          <>
            {/* Mekko Chart */}
            <div id="visualization" className="scroll-mt-20">
              <MekkoChart
                categories={categories}
                scores={currentData.scores}
                domainScores={currentData.domainScores}
              />
            </div>

            {/* Domain Sections (detailed cards) */}
            <div className="space-y-8">
              {domains.map((domainId) => (
                <div key={domainId} id={domainId} className="scroll-mt-20">
                  <DomainSection
                    domainId={domainId}
                    categories={categories}
                    scores={currentData.scores}
                    domainScore={currentData.domainScores[domainId]}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* State View */
          <div id="visualization" className="scroll-mt-20">
            <USHeatmap states={statesData.states} />
          </div>
        )}

        {/* Actions & Pushback Summary */}
        {actionsPushbackData && (
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-gold/30 p-6 scroll-mt-20 bg-gradient-to-r from-gold/5 to-transparent">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-navy dark:text-cream mb-2">
                  Actions &amp; Pushback Tracker
                </h2>
                <p className="text-sm text-navy/70 dark:text-cream/70 mb-3">
                  Track executive actions and legal/institutional responses in real time.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-bold text-navy dark:text-cream">{actionsPushbackData.summary.totalActions}</span>
                    <span className="text-navy/60 dark:text-cream/60 ml-1">actions tracked</span>
                  </div>
                  <div>
                    <span className="font-bold text-red-600 dark:text-red-400">{actionsPushbackData.summary.blockedOrReversed}</span>
                    <span className="text-navy/60 dark:text-cream/60 ml-1">blocked or reversed</span>
                  </div>
                  <div>
                    <span className="font-bold text-green-600 dark:text-green-400">{Math.round(actionsPushbackData.summary.implementationRate * 100)}%</span>
                    <span className="text-navy/60 dark:text-cream/60 ml-1">implementation rate</span>
                  </div>
                </div>
              </div>
              <Link
                href="/actions-pushback"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold text-navy font-medium hover:bg-gold-dark transition-colors"
              >
                View Tracker
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* About Section */}
        <div id="about" className="bg-white dark:bg-navy-600 rounded-lg p-6 shadow-ln-light border border-navy/10 scroll-mt-20">
          <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
            About This Assessment
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-navy/80 dark:text-cream/80">
              The US Political Risk Framework evaluates 10 categories across three domains to provide
              a comprehensive assessment of democratic health and institutional integrity. Each
              category is scored on a 1-10 scale, with detailed rubrics guiding the assessment.
            </p>
            <ul className="mt-4 space-y-2 text-navy/80 dark:text-cream/80">
              <li>
                <strong className="text-navy dark:text-cream">Rule of Law & National Security:</strong> Elections, judicial independence,
                and security apparatus integrity
              </li>
              <li>
                <strong className="text-navy dark:text-cream">Operating & Economic Environment:</strong> Regulatory stability, trade policy,
                government contracts, and fiscal policy
              </li>
              <li>
                <strong className="text-navy dark:text-cream">Societal & Institutional Integrity:</strong> Media freedom, civil discourse,
                and institutional independence
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
