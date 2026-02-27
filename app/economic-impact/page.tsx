'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CurrentAssessment,
  EconomicIndicatorsData,
  EconomicIndicator,
} from '@/lib/types';
import { getScoreColor } from '@/lib/risk-levels';
import PageNav from '@/components/PageNav';
import currentData from '@/data/current.json';
import economicData from '@/data/economic-indicators.json';

const PAGE_SECTIONS = [
  { id: 'summary', label: 'Summary Scores' },
  { id: 'indicators', label: 'Indicators' },
  { id: 'sensitivity', label: 'Sensitivity Matrix' },
];

const categoryNames: Record<string, string> = {
  'elections': 'Elections',
  'rule-of-law': 'Rule of Law',
  'national-security': 'National Security',
  'regulatory-stability': 'Regulatory Stability',
  'trade-policy': 'Trade Policy',
  'government-contracts': 'Gov\'t Contracts',
  'fiscal-policy': 'Fiscal Policy',
  'media-freedom': 'Media Freedom',
  'civil-discourse': 'Civil Discourse',
  'institutional-integrity': 'Institutional Integrity',
};

const CATEGORIES = Object.keys(categoryNames);

function formatValue(value: number, unit: string): string {
  if (unit === 'percent' || unit === 'percent change') {
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
  }
  if (unit === 'basis points') {
    return `${value} bps`;
  }
  if (unit === 'USD billions') {
    return `$${value.toFixed(1)}B`;
  }
  if (unit === 'index') {
    return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  return value.toString();
}

function calculateIndicatorImpact(
  indicator: EconomicIndicator,
  scores: Record<string, number>
): { score: number; level: string; color: string; topDrivers: { category: string; contribution: number }[] } {
  let weightedSum = 0;
  let totalWeight = 0;
  const contributions: { category: string; contribution: number }[] = [];

  for (const [categoryId, sensitivity] of Object.entries(indicator.sensitivity)) {
    const score = scores[categoryId] || 0;
    const weight = Math.abs(sensitivity.weight);
    const contribution = score * weight;
    weightedSum += contribution;
    totalWeight += weight * 10;
    contributions.push({ category: categoryId, contribution });
  }

  const impactScore = totalWeight > 0 ? (weightedSum / totalWeight) * 10 : 0;
  const roundedScore = Math.round(impactScore * 10) / 10;

  let level: string;
  let color: string;
  if (roundedScore <= indicator.riskThresholds.low.max) {
    level = indicator.riskThresholds.low.impact;
    color = indicator.riskThresholds.low.color;
  } else if (roundedScore <= indicator.riskThresholds.moderate.max) {
    level = indicator.riskThresholds.moderate.impact;
    color = indicator.riskThresholds.moderate.color;
  } else if (roundedScore <= indicator.riskThresholds.high.max) {
    level = indicator.riskThresholds.high.impact;
    color = indicator.riskThresholds.high.color;
  } else {
    level = indicator.riskThresholds.severe.impact;
    color = indicator.riskThresholds.severe.color;
  }

  const topDrivers = contributions
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);

  return { score: roundedScore, level, color, topDrivers };
}

function getColorClass(color: string): string {
  switch (color) {
    case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'yellow': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

function getColorBorder(color: string): string {
  switch (color) {
    case 'green': return 'border-green-500';
    case 'yellow': return 'border-yellow-500';
    case 'orange': return 'border-orange-500';
    case 'red': return 'border-red-500';
    default: return 'border-gray-500';
  }
}

export default function EconomicImpactPage() {
  const current = currentData as CurrentAssessment;
  const economic = economicData as EconomicIndicatorsData;
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'market' | 'economic'>('all');
  const [showDefinitions, setShowDefinitions] = useState(false);

  const scores = useMemo(() => {
    const s: Record<string, number> = {};
    for (const [catId, catData] of Object.entries(current.scores)) {
      s[catId] = catData.score;
    }
    return s;
  }, [current]);

  const indicatorImpacts = useMemo(() => {
    const impacts: Record<string, ReturnType<typeof calculateIndicatorImpact>> = {};
    for (const indicator of economic.indicators) {
      impacts[indicator.id] = calculateIndicatorImpact(indicator, scores);
    }
    return impacts;
  }, [economic.indicators, scores]);

  const filteredIndicators = useMemo(() => {
    if (filterCategory === 'all') return economic.indicators;
    return economic.indicators.filter(i => i.category === filterCategory);
  }, [economic.indicators, filterCategory]);

  const marketIndicators = economic.indicators.filter(i => i.category === 'market');
  const economicIndicators = economic.indicators.filter(i => i.category === 'economic');

  const marketImpactScore = marketIndicators.reduce((sum, i) => sum + indicatorImpacts[i.id].score, 0) / marketIndicators.length;
  const economicImpactScore = economicIndicators.reduce((sum, i) => sum + indicatorImpacts[i.id].score, 0) / economicIndicators.length;

  const selectedIndicatorData = selectedIndicator
    ? economic.indicators.find(i => i.id === selectedIndicator)
    : null;

  return (
    <>
      <PageNav sections={PAGE_SECTIONS} />
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream">Economic Impact</h1>
        <p className="mt-2 text-navy/70 dark:text-cream/70">
          How political risk scores affect market and economic indicators
        </p>
        <p className="text-xs text-navy/50 dark:text-cream/50 mt-1">
          Data as of {economic.lastUpdated}
        </p>
      </div>

      {/* Score Definitions Toggle */}
      <div className="bg-gradient-to-r from-navy/5 to-transparent dark:from-cream/5 rounded-lg p-4 border border-navy/10">
        <button
          onClick={() => setShowDefinitions(!showDefinitions)}
          className="flex items-center gap-2 text-sm font-medium text-navy dark:text-cream"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showDefinitions ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          What do these scores mean?
        </button>
        {showDefinitions && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-navy-600 rounded-lg p-4 border border-navy/10">
              <h3 className="font-semibold text-navy dark:text-cream mb-2">
                {economic.scoreDefinitions.marketImpactScore.name}
              </h3>
              <p className="text-sm text-navy/70 dark:text-cream/70 mb-2">
                {economic.scoreDefinitions.marketImpactScore.definition}
              </p>
              <p className="text-xs text-navy/60 dark:text-cream/60 italic">
                {economic.scoreDefinitions.marketImpactScore.interpretation}
              </p>
            </div>
            <div className="bg-white dark:bg-navy-600 rounded-lg p-4 border border-navy/10">
              <h3 className="font-semibold text-navy dark:text-cream mb-2">
                {economic.scoreDefinitions.economicImpactScore.name}
              </h3>
              <p className="text-sm text-navy/70 dark:text-cream/70 mb-2">
                {economic.scoreDefinitions.economicImpactScore.definition}
              </p>
              <p className="text-xs text-navy/60 dark:text-cream/60 italic">
                {economic.scoreDefinitions.economicImpactScore.interpretation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div id="summary" className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-mt-20">
        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
          <div className="text-sm text-navy/60 dark:text-cream/60 mb-1">Political Risk Score</div>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-bold"
              style={{ color: getScoreColor(current.overallScore) }}
            >
              {current.overallScore.toFixed(1)}
            </span>
            <span className="text-sm text-navy/60 dark:text-cream/60">/ 10</span>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
          <div className="text-sm text-navy/60 dark:text-cream/60 mb-1">Market Impact Score</div>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-bold"
              style={{ color: getScoreColor(marketImpactScore) }}
            >
              {marketImpactScore.toFixed(1)}
            </span>
            <span className="text-sm text-navy/60 dark:text-cream/60">/ 10</span>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
          <div className="text-sm text-navy/60 dark:text-cream/60 mb-1">Economic Impact Score</div>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-bold"
              style={{ color: getScoreColor(economicImpactScore) }}
            >
              {economicImpactScore.toFixed(1)}
            </span>
            <span className="text-sm text-navy/60 dark:text-cream/60">/ 10</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-4 border border-navy/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-navy dark:text-cream mr-2">Filter:</span>
          {(['all', 'market', 'economic'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                filterCategory === cat
                  ? 'bg-navy text-white'
                  : 'bg-cream dark:bg-navy-700 text-navy dark:text-cream hover:bg-gold/20'
              }`}
            >
              {cat === 'all' ? 'All Indicators' : cat === 'market' ? 'Market Indicators' : 'Economic Indicators'}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators Grid */}
      <div id="indicators" className="grid grid-cols-1 md:grid-cols-2 gap-4 scroll-mt-20">
        {filteredIndicators.map((indicator) => {
          const impact = indicatorImpacts[indicator.id];
          const isSelected = selectedIndicator === indicator.id;
          const yoyChange = indicator.currentData.yearOverYearChange;

          return (
            <button
              key={indicator.id}
              onClick={() => setSelectedIndicator(isSelected ? null : indicator.id)}
              className={`text-left bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border-2 p-4 transition-all hover:shadow-lg ${
                isSelected ? getColorBorder(impact.color) : 'border-transparent'
              }`}
            >
              {/* Header - compact on mobile, spacious on desktop */}
              <div className="flex items-start justify-between mb-0 md:mb-3">
                <div>
                  <h3 className="font-semibold text-navy dark:text-cream">{indicator.name}</h3>
                  <span className="text-xs text-navy/50 dark:text-cream/50 uppercase">
                    {indicator.category} indicator
                  </span>
                </div>
                <div className="text-right flex items-center gap-2 md:block">
                  <span
                    className="text-xl md:text-2xl font-bold"
                    style={{ color: getScoreColor(impact.score) }}
                  >
                    {impact.score.toFixed(1)}
                  </span>
                  <span className={`md:hidden inline-block px-2 py-0.5 rounded text-xs font-medium ${getColorClass(impact.color)}`}>
                    {impact.level}
                  </span>
                  <div className="hidden md:block text-xs text-navy/50 dark:text-cream/50">impact score</div>
                </div>
              </div>

              {/* Detailed content - hidden on mobile unless selected */}
              <div className={`${isSelected ? 'block' : 'hidden'} md:block mt-3`}>
                {/* Current Value */}
                <div className="bg-cream/50 dark:bg-navy-700/50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-navy dark:text-cream">
                        {formatValue(indicator.currentData.value, indicator.unit)}
                      </div>
                      <div className="text-xs text-navy/50 dark:text-cream/50">
                        as of {indicator.currentData.asOf} · {indicator.currentData.source}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        yoyChange > 0 ? 'text-red-600' : yoyChange < 0 ? 'text-green-600' : 'text-navy/50'
                      }`}>
                        {yoyChange > 0 ? '+' : ''}{yoyChange.toFixed(1)}%
                      </div>
                      <div className="text-xs text-navy/50 dark:text-cream/50">YoY</div>
                    </div>
                  </div>
                  <p className="text-xs text-navy/60 dark:text-cream/60 mt-2">
                    {indicator.currentData.context}
                  </p>
                </div>

                <div className={`hidden md:inline-block px-2 py-1 rounded text-xs font-medium ${getColorClass(impact.color)}`}>
                  {impact.level}
                </div>
              </div>

              {/* Mobile tap hint */}
              {!isSelected && (
                <div className="md:hidden text-xs text-center text-navy/40 dark:text-cream/40 mt-2">
                  Tap for details
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Indicator Detail */}
      {selectedIndicatorData && (
        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 overflow-hidden">
          <div className="p-6 border-b border-navy/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-navy dark:text-cream">
                  {selectedIndicatorData.name}
                </h2>
                <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
                  {selectedIndicatorData.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="text-navy/40 hover:text-navy dark:text-cream/40 dark:hover:text-cream"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Year over Year Comparison */}
          <div className="p-6 border-b border-navy/10 bg-cream/20 dark:bg-navy-700/20">
            <h3 className="text-sm font-semibold text-navy/60 dark:text-cream/60 uppercase tracking-wider mb-3">
              Year-over-Year Comparison
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-navy/50 dark:text-cream/50">
                  {selectedIndicatorData.currentData.priorYearDate}
                </div>
                <div className="text-xl font-bold text-navy/70 dark:text-cream/70">
                  {formatValue(selectedIndicatorData.currentData.priorYearValue, selectedIndicatorData.unit)}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-navy/30 dark:text-cream/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-navy/50 dark:text-cream/50">
                  {selectedIndicatorData.currentData.asOf}
                </div>
                <div className="text-xl font-bold text-navy dark:text-cream">
                  {formatValue(selectedIndicatorData.currentData.value, selectedIndicatorData.unit)}
                </div>
                <div className={`text-sm font-medium ${
                  selectedIndicatorData.currentData.yearOverYearChange > 0 ? 'text-red-600' :
                  selectedIndicatorData.currentData.yearOverYearChange < 0 ? 'text-green-600' : 'text-navy/50'
                }`}>
                  {selectedIndicatorData.currentData.yearOverYearChange > 0 ? '+' : ''}
                  {selectedIndicatorData.currentData.yearOverYearChange.toFixed(1)}% YoY
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-semibold text-navy/60 dark:text-cream/60 uppercase tracking-wider mb-4">
              Risk Category Sensitivity
            </h3>
            <div className="space-y-3">
              {CATEGORIES.map((catId) => {
                const sensitivity = selectedIndicatorData.sensitivity[catId];
                if (!sensitivity) return null;
                const score = scores[catId];
                const contribution = score * Math.abs(sensitivity.weight);
                const maxContribution = 10 * Math.abs(sensitivity.weight);
                const percentage = (contribution / maxContribution) * 100;

                return (
                  <div key={catId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/category/${catId}`}
                          className="text-sm font-medium text-navy dark:text-cream hover:text-gold transition-colors"
                        >
                          {categoryNames[catId]}
                        </Link>
                        <span className="text-xs text-navy/40 dark:text-cream/40">
                          (weight: {Math.abs(sensitivity.weight).toFixed(2)})
                        </span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: getScoreColor(score) }}>
                        {score}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-cream dark:bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getScoreColor(score),
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-navy/50 dark:text-cream/50 mt-1">
                      {sensitivity.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impact Thresholds */}
          <div className="p-6 bg-cream/30 dark:bg-navy-700/30 border-t border-navy/10">
            <h3 className="text-sm font-semibold text-navy/60 dark:text-cream/60 uppercase tracking-wider mb-3">
              Impact Thresholds
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(selectedIndicatorData.riskThresholds).map(([level, threshold]) => (
                <div key={level} className={`p-3 rounded-lg ${getColorClass(threshold.color)}`}>
                  <div className="text-xs uppercase font-medium opacity-70">{level}</div>
                  <div className="text-sm font-semibold">{threshold.impact}</div>
                  <div className="text-xs opacity-70">Score ≤ {threshold.max}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sensitivity Matrix */}
      <div id="sensitivity" className="scroll-mt-20">
        {/* Desktop: full table */}
        <div className="hidden md:block bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 overflow-hidden">
          <div className="p-6 border-b border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream">Sensitivity Matrix</h2>
            <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
              How strongly each risk category affects each indicator (darker = stronger relationship)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-cream dark:bg-navy-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-navy/60 dark:text-cream/60 sticky left-0 bg-cream dark:bg-navy-700">
                    Indicator
                  </th>
                  {CATEGORIES.map((catId) => (
                    <th key={catId} className="px-2 py-2 text-center font-medium text-navy/60 dark:text-cream/60 whitespace-nowrap">
                      <span className="writing-mode-vertical" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
                        {categoryNames[catId]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10 dark:divide-cream/10">
                {economic.indicators.map((indicator) => (
                  <tr key={indicator.id} className="hover:bg-cream/50 dark:hover:bg-navy-700/50">
                    <td className="px-3 py-2 font-medium text-navy dark:text-cream sticky left-0 bg-white dark:bg-navy-600 whitespace-nowrap">
                      {indicator.name}
                    </td>
                    {CATEGORIES.map((catId) => {
                      const sensitivity = indicator.sensitivity[catId];
                      const weight = sensitivity ? Math.abs(sensitivity.weight) : 0;
                      const opacity = weight;
                      const isPositive = sensitivity && sensitivity.weight > 0;

                      return (
                        <td key={catId} className="px-2 py-2 text-center">
                          {weight > 0 && (
                            <div
                              className="w-8 h-8 mx-auto rounded flex items-center justify-center text-white font-medium"
                              style={{
                                backgroundColor: isPositive
                                  ? `rgba(239, 68, 68, ${opacity})`
                                  : `rgba(59, 130, 246, ${opacity})`,
                              }}
                              title={sensitivity?.description}
                            >
                              {weight.toFixed(1)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-navy/10 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-navy/60 dark:text-cream/60">Negative correlation (risk ↑ = indicator ↓)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-navy/60 dark:text-cream/60">Positive correlation (risk ↑ = indicator ↑)</span>
            </div>
          </div>
        </div>

        {/* Mobile: card-based sensitivity view */}
        <div className="md:hidden bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 overflow-hidden">
          <div className="p-4 border-b border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream">Sensitivity Matrix</h2>
            <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
              How risk categories affect each indicator
            </p>
          </div>
          <div className="p-4 space-y-4">
            {economic.indicators.map((indicator) => {
              const sensitiveCats = CATEGORIES
                .filter(catId => indicator.sensitivity[catId])
                .sort((a, b) => Math.abs(indicator.sensitivity[b]?.weight || 0) - Math.abs(indicator.sensitivity[a]?.weight || 0));

              return (
                <div key={indicator.id} className="border border-navy/10 rounded-lg p-3">
                  <h3 className="font-medium text-navy dark:text-cream text-sm mb-2">{indicator.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {sensitiveCats.map(catId => {
                      const s = indicator.sensitivity[catId];
                      const weight = Math.abs(s.weight);
                      const isPositive = s.weight > 0;
                      return (
                        <span
                          key={catId}
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            isPositive
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                          style={{ opacity: 0.4 + weight * 0.6 }}
                        >
                          {categoryNames[catId]}: {weight.toFixed(1)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-navy/10 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-navy/60 dark:text-cream/60">Negative (risk ↑ = indicator ↓)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-navy/60 dark:text-cream/60">Positive (risk ↑ = indicator ↑)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Link to Scenarios */}
      <div className="bg-gradient-to-r from-gold/10 to-transparent rounded-lg p-6 border border-gold/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-navy dark:text-cream">Model Future Scenarios</h3>
            <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
              See how potential political events could affect these economic indicators
            </p>
          </div>
          <Link
            href="/scenarios"
            className="px-4 py-2 bg-gold text-navy font-medium rounded-lg hover:bg-gold-dark transition-colors"
          >
            Open Scenario Modeling
          </Link>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-medium"
        >
          <span>&larr;</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
      </div>
    </>
  );
}
