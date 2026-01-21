'use client';

import { useState, useMemo } from 'react';
import { CategoriesData, CurrentAssessment, StatesData, DomainId } from '@/lib/types';
import OverallScore from '@/components/OverallScore';
import RiskViewToggle from '@/components/RiskViewToggle';
import MekkoChart from '@/components/MekkoChart';
import USHeatmap from '@/components/USHeatmap';
import DomainSection from '@/components/DomainSection';
import PageNav from '@/components/PageNav';

interface DashboardProps {
  categoriesData: CategoriesData;
  currentData: CurrentAssessment;
  statesData: StatesData;
}

export default function Dashboard({ categoriesData, currentData, statesData }: DashboardProps) {
  const [view, setView] = useState<'national' | 'state'>('national');

  const { categories } = categoriesData;
  const domains: DomainId[] = ['rule-of-law', 'operating-economic', 'societal-institutional'];

  const pageSections = useMemo(() => {
    const base = [
      { id: 'overall-score', label: 'Overall Score' },
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
