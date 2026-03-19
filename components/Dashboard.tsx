'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CategoriesData, CurrentAssessment, StatesData, ActionsPushbackData, HistoricalSnapshot, HistoricalChangesData, DomainId } from '@/lib/types';
import { getScoreColor, getRiskLevel } from '@/lib/risk-levels';
import { getDomainInfo } from '@/lib/scoring';
import siteConfig from '@/data/site-config.json';
import OverallScore from '@/components/OverallScore';
import RiskViewToggle from '@/components/RiskViewToggle';
import CategoryList from '@/components/CategoryList';
import USHeatmap from '@/components/USHeatmap';
import Spotlight from '@/components/Spotlight';
import KeyTakeaways from '@/components/KeyTakeaways';
import ThreatBriefing from '@/components/ThreatBriefing';
import MethodologyBanner from '@/components/MethodologyBanner';
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

const domainConfig: { id: DomainId; accentColor: string; description: string; categories: string[] }[] = [
  {
    id: 'rule-of-law',
    accentColor: '#4a4a4a',
    description: 'Erodes the rule-based environment companies rely on for contracts, dispute resolution, and security of operations.',
    categories: ['Election Interference', 'Legal / Defying Court Orders', 'National Security', 'Intimidation & Political Violence'],
  },
  {
    id: 'operating-economic',
    accentColor: '#F5A623',
    description: 'Generates unpredictable operating conditions, deters investment, and distorts competition.',
    categories: ['Business Interference', 'Major Economic Disruptions', 'Cronyism & Retaliation', 'Fiscal & Monetary Policy', 'Public Pressure & Polarization'],
  },
  {
    id: 'societal-institutional',
    accentColor: '#1B2A4A',
    description: 'Exposes companies to reputational risk, workforce pressures, and challenges to innovation and talent pipelines.',
    categories: ['Suppression of Freedom of Expression', 'Erosion of Institutions & Norms'],
  },
];

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
  const [frameworkOpen, setFrameworkOpen] = useState(true);

  const { categories } = categoriesData;

  const latestChange = useMemo(() => {
    return historicalChanges.changes[historicalChanges.changes.length - 1];
  }, [historicalChanges]);

  const latestChangeSummary = latestChange?.summary || '';
  const latestKeyDevelopments = latestChange?.keyDevelopments || [];

  const pageSections = useMemo(() => {
    const base = [
      { id: 'briefing', label: 'Briefing' },
      { id: 'key-changes', label: 'Key Changes' },
      { id: 'overall-score', label: 'Score Overview' },
      { id: 'framework', label: 'Framework' },
      { id: 'categories', label: view === 'national' ? 'Categories' : 'State Map' },
      { id: 'spotlight', label: 'Top Risk Areas' },
    ];
    if (actionsPushbackData && siteConfig.pages['actions-pushback'].enabled) {
      base.splice(5, 0, { id: 'actions', label: 'Actions' });
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
            Tracking political risk for business across 11 key indicators
          </p>
        </div>

        {/* Methodology Banner (dismissible, for new users) */}
        <MethodologyBanner />

        {/* Threat Environment Briefing — leads with narrative */}
        <div id="briefing" className="scroll-mt-20">
          <ThreatBriefing
            currentData={currentData}
            historicalChanges={historicalChanges}
            categoriesData={categoriesData}
          />
        </div>

        {/* Key Changes */}
        <div id="key-changes" className="scroll-mt-20">
          <KeyTakeaways
            current={currentData}
            previousSnapshot={previousSnapshot}
            historicalChanges={historicalChanges}
          />
        </div>

        {/* Overall Score (demoted — context bar, not hero) */}
        <div id="overall-score" className="scroll-mt-20">
          <OverallScore
            score={currentData.overallScore}
            riskLevel={currentData.riskLevel}
            assessmentDate={currentData.assessmentDate}
            assessmentPeriod={currentData.assessmentPeriod}
            previousScore={previousSnapshot.overallScore}
            summary={latestChangeSummary}
            keyDevelopments={latestKeyDevelopments}
            historicalSnapshots={historicalSnapshots}
          />
        </div>

        {/* About Our Framework — collapsible domain cards */}
        <div id="framework" className="scroll-mt-20">
          <div className="bg-white dark:bg-navy-600 rounded-xl border border-navy/10 dark:border-cream/10 overflow-hidden">
            <button
              onClick={() => setFrameworkOpen(o => !o)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream/30 dark:hover:bg-navy-700/30 transition-colors"
            >
              <h2 className="text-sm font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider">
                About Our Framework
              </h2>
              <svg
                className={`w-4 h-4 text-navy/30 dark:text-cream/30 transition-transform ${frameworkOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {frameworkOpen && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {domainConfig.map((d) => {
                  const domainScore = currentData.domainScores[d.id];
                  const scoreColor = getScoreColor(domainScore);
                  const level = getRiskLevel(domainScore);
                  const info = getDomainInfo(d.id);

                  return (
                    <a key={d.id} href={`#domain-${d.id}`} className="rounded-lg border border-navy/10 dark:border-cream/10 overflow-hidden hover:shadow-ln-medium hover:border-gold/30 transition-all block">
                      <div className="h-1.5" style={{ backgroundColor: d.accentColor }} />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-navy dark:text-cream leading-snug">{info.name}</h3>
                          <span className="text-lg font-black tabular-nums flex-shrink-0" style={{ color: scoreColor }}>
                            {domainScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-[10px] font-medium" style={{ color: scoreColor }}>{level}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-navy/5 dark:bg-cream/5">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(domainScore / 10) * 100}%`, backgroundColor: scoreColor }}
                          />
                        </div>
                        <div className="mt-3 pt-3 border-t border-navy/5 dark:border-cream/5">
                          <p className="text-xs text-navy/60 dark:text-cream/60 leading-relaxed mb-3">{d.description}</p>
                          <ul className="space-y-1">
                            {d.categories.map((cat) => (
                              <li key={cat} className="flex items-center gap-2 text-xs text-navy/70 dark:text-cream/70">
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.accentColor }} />
                                {cat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
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
        {actionsPushbackData && siteConfig.pages['actions-pushback'].enabled && (
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
                  <span className="font-bold text-navy dark:text-cream">{actionsPushbackData.summary.totalActions}</span> actions tracked
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

        {/* Spotlight: Top Risk Areas (moved lower — score-first framing is supporting, not leading) */}
        <div id="spotlight" className="scroll-mt-20">
          <Spotlight currentData={currentData} />
        </div>
      </div>
    </>
  );
}
