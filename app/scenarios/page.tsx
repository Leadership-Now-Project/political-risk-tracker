'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CurrentAssessment,
  ScenariosData,
  ScenarioEvent,
  ScenarioImpact,
  DomainId,
} from '@/lib/types';
import { getRiskLevel, getScoreColor } from '@/lib/risk-levels';
import RiskLevelBadge from '@/components/RiskLevelBadge';
import PageNav from '@/components/PageNav';
import currentData from '@/data/current.json';
import scenariosData from '@/data/scenarios.json';

const PAGE_SECTIONS = [
  { id: 'comparison', label: 'Score Comparison' },
  { id: 'custom-event', label: 'Custom Event' },
  { id: 'predefined', label: 'Predefined Events' },
  { id: 'results', label: 'Results' },
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

const domainNames: Record<DomainId, string> = {
  'rule-of-law': 'Rule of Law & National Security',
  'operating-economic': 'Operating & Economic',
  'societal-institutional': 'Societal & Institutional',
};

const DOMAINS: Record<DomainId, string[]> = {
  'rule-of-law': ['elections', 'rule-of-law', 'national-security'],
  'operating-economic': ['regulatory-stability', 'trade-policy', 'government-contracts', 'fiscal-policy'],
  'societal-institutional': ['media-freedom', 'civil-discourse', 'institutional-integrity'],
};

const CATEGORIES = Object.keys(categoryNames);

interface CustomImpact extends ScenarioImpact {
  isCustom?: boolean;
}

interface SelectedEvent {
  event: ScenarioEvent | { id: string; label: string; impacts: CustomImpact[]; isCustom: true };
  impacts: CustomImpact[];
}

function calculateScores(
  baseScores: Record<string, number>,
  selectedEvents: SelectedEvent[]
) {
  const newScores = { ...baseScores };

  // Apply all impacts
  for (const { impacts } of selectedEvents) {
    for (const impact of impacts) {
      if (newScores[impact.category] !== undefined) {
        newScores[impact.category] = Math.max(1, Math.min(10, newScores[impact.category] + impact.delta));
      }
    }
  }

  // Calculate domain scores
  const domainScores: Record<DomainId, number> = {
    'rule-of-law': 0,
    'operating-economic': 0,
    'societal-institutional': 0,
  };

  for (const [domain, categories] of Object.entries(DOMAINS) as [DomainId, string[]][]) {
    const sum = categories.reduce((acc, cat) => acc + newScores[cat], 0);
    domainScores[domain] = Math.round((sum / categories.length) * 100) / 100;
  }

  // Calculate overall score
  const overallScore = Math.round((CATEGORIES.reduce((acc, cat) => acc + newScores[cat], 0) / CATEGORIES.length) * 10) / 10;

  return { categoryScores: newScores, domainScores, overallScore };
}

export default function ScenariosPage() {
  const current = currentData as CurrentAssessment;
  const scenarios = scenariosData as ScenariosData;

  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);
  const [filterDomain, setFilterDomain] = useState<DomainId | 'all'>('all');
  const [customEventText, setCustomEventText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Get base scores from current assessment
  const baseScores = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const [catId, catData] of Object.entries(current.scores)) {
      scores[catId] = catData.score;
    }
    return scores;
  }, [current]);

  // Calculate projected scores
  const projected = useMemo(
    () => calculateScores(baseScores, selectedEvents),
    [baseScores, selectedEvents]
  );

  // Filter events by domain
  const filteredEvents = useMemo(() => {
    if (filterDomain === 'all') return scenarios.events;
    return scenarios.events.filter((e) => e.domain === filterDomain);
  }, [scenarios.events, filterDomain]);

  const toggleEvent = (event: ScenarioEvent) => {
    setSelectedEvents((prev) => {
      const exists = prev.find((e) => e.event.id === event.id);
      if (exists) {
        return prev.filter((e) => e.event.id !== event.id);
      }
      return [...prev, { event, impacts: event.impacts }];
    });
  };

  const removeEvent = (eventId: string) => {
    setSelectedEvents((prev) => prev.filter((e) => e.event.id !== eventId));
  };

  const evaluateCustomEvent = async () => {
    if (!customEventText.trim()) return;

    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const response = await fetch('/api/evaluate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDescription: customEventText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to evaluate event');
      }

      const evaluation = await response.json();

      const customEvent: SelectedEvent = {
        event: {
          id: `custom-${Date.now()}`,
          label: customEventText,
          impacts: evaluation.impacts.map((i: ScenarioImpact) => ({ ...i, isCustom: true })),
          isCustom: true,
        },
        impacts: evaluation.impacts.map((i: ScenarioImpact) => ({ ...i, isCustom: true })),
      };

      setSelectedEvents((prev) => [...prev, customEvent]);
      setCustomEventText('');
    } catch (error) {
      setEvaluationError(error instanceof Error ? error.message : 'Failed to evaluate event');
    } finally {
      setIsEvaluating(false);
    }
  };

  const overallChange = projected.overallScore - current.overallScore;
  const currentRiskLevel = getRiskLevel(current.overallScore);
  const projectedRiskLevel = getRiskLevel(projected.overallScore);

  return (
    <>
      <PageNav sections={PAGE_SECTIONS} />
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream">Scenario Modeling</h1>
          <p className="mt-2 text-navy/70 dark:text-cream/70">
            Explore how potential events could affect political risk scores
          </p>
        </div>

        {/* Score Comparison Header */}
        <div id="comparison" className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-mt-20">
        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
          <div className="text-sm text-navy/60 dark:text-cream/60 mb-1">Current Score</div>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-bold"
              style={{ color: getScoreColor(current.overallScore) }}
            >
              {current.overallScore.toFixed(1)}
            </span>
            <RiskLevelBadge level={currentRiskLevel} />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
          <div className="text-sm text-navy/60 dark:text-cream/60 mb-1">Projected Score</div>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-bold"
              style={{ color: getScoreColor(projected.overallScore) }}
            >
              {projected.overallScore.toFixed(1)}
            </span>
            <RiskLevelBadge level={projectedRiskLevel} />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
          <div className="text-sm text-navy/60 dark:text-cream/60 mb-1">Net Change</div>
          <div className="flex items-center gap-3">
            <span
              className={`text-4xl font-bold ${
                overallChange > 0
                  ? 'text-risk-high'
                  : overallChange < 0
                  ? 'text-green-600'
                  : 'text-navy/50 dark:text-cream/50'
              }`}
            >
              {overallChange > 0 ? '+' : ''}
              {overallChange.toFixed(1)}
            </span>
            {selectedEvents.length > 0 && (
              <span className="text-sm text-navy/60 dark:text-cream/60">
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Event Selection */}
        <div className="space-y-6">
          {/* Custom Event Input */}
          <div id="custom-event" className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 overflow-hidden scroll-mt-20">
            <div className="p-4 border-b border-navy/10 bg-gradient-to-r from-gold/10 to-transparent">
              <h2 className="text-lg font-semibold text-navy dark:text-cream flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Custom Event (AI-Powered)
              </h2>
              <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
                Describe any hypothetical event and AI will estimate its impact
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={customEventText}
                onChange={(e) => setCustomEventText(e.target.value)}
                placeholder="e.g., Congress passes constitutional amendment limiting presidential emergency powers..."
                className="w-full px-3 py-2 border border-navy/20 dark:border-cream/20 rounded-lg bg-cream/50 dark:bg-navy-700 text-navy dark:text-cream placeholder:text-navy/40 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                rows={3}
              />
              {evaluationError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{evaluationError}</p>
              )}
              <button
                onClick={evaluateCustomEvent}
                disabled={!customEventText.trim() || isEvaluating}
                className="mt-3 px-4 py-2 bg-gold text-navy font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Evaluating...
                  </>
                ) : (
                  <>Evaluate Impact</>
                )}
              </button>
            </div>
          </div>

          {/* Predefined Events */}
          <div id="predefined" className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 overflow-hidden scroll-mt-20">
            <div className="p-4 border-b border-navy/10">
              <h2 className="text-lg font-semibold text-navy dark:text-cream">Predefined Events</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setFilterDomain('all')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    filterDomain === 'all'
                      ? 'bg-navy text-white'
                      : 'bg-cream dark:bg-navy-700 text-navy dark:text-cream hover:bg-gold/20'
                  }`}
                >
                  All
                </button>
                {(Object.keys(domainNames) as DomainId[]).map((domain) => (
                  <button
                    key={domain}
                    onClick={() => setFilterDomain(domain)}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      filterDomain === domain
                        ? 'bg-navy text-white'
                        : 'bg-cream dark:bg-navy-700 text-navy dark:text-cream hover:bg-gold/20'
                    }`}
                  >
                    {domainNames[domain]}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-navy/10 dark:divide-cream/10 max-h-[500px] overflow-y-auto">
              {filteredEvents.map((event) => {
                const isSelected = selectedEvents.some((e) => e.event.id === event.id);
                const netDelta = event.impacts.reduce((sum, i) => sum + i.delta, 0);

                return (
                  <button
                    key={event.id}
                    onClick={() => toggleEvent(event)}
                    className={`w-full px-4 py-3 text-left hover:bg-cream/50 dark:hover:bg-navy-700/50 transition-colors ${
                      isSelected ? 'bg-gold/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-gold border-gold'
                            : 'border-navy/30 dark:border-cream/30'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-navy dark:text-cream">
                          {event.label}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              event.likelihood === 'high'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : event.likelihood === 'moderate'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {event.likelihood} likelihood
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              netDelta > 0
                                ? 'text-red-600 dark:text-red-400'
                                : netDelta < 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-navy/50'
                            }`}
                          >
                            {netDelta > 0 ? '+' : ''}{netDelta} net impact
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div id="results" className="space-y-6 scroll-mt-20">
          {/* Selected Events */}
          {selectedEvents.length > 0 && (
            <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 overflow-hidden">
              <div className="p-4 border-b border-navy/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-navy dark:text-cream">
                    Selected Events ({selectedEvents.length})
                  </h2>
                  <button
                    onClick={() => setSelectedEvents([])}
                    className="text-sm text-navy/60 dark:text-cream/60 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <div className="divide-y divide-navy/10 dark:divide-cream/10 max-h-[300px] overflow-y-auto">
                {selectedEvents.map(({ event, impacts }) => (
                  <div key={event.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-navy dark:text-cream flex items-center gap-2">
                          {event.label}
                          {'isCustom' in event && event.isCustom && (
                            <span className="text-xs px-1.5 py-0.5 bg-gold/20 text-gold-dark rounded">
                              AI
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {impacts.map((impact, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded ${
                                impact.delta > 0
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}
                              title={impact.reason}
                            >
                              {categoryNames[impact.category]}: {impact.delta > 0 ? '+' : ''}{impact.delta}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removeEvent(event.id)}
                        className="text-navy/40 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 overflow-hidden">
            <div className="p-4 border-b border-navy/10">
              <h2 className="text-lg font-semibold text-navy dark:text-cream">Score Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream dark:bg-navy-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-navy/60 dark:text-cream/60 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-navy/60 dark:text-cream/60 uppercase">
                      Current
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-navy/60 dark:text-cream/60 uppercase">
                      Projected
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-navy/60 dark:text-cream/60 uppercase">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10 dark:divide-cream/10">
                  {CATEGORIES.map((catId) => {
                    const currentScore = baseScores[catId];
                    const projectedScore = projected.categoryScores[catId];
                    const change = projectedScore - currentScore;

                    return (
                      <tr key={catId} className="hover:bg-cream/50 dark:hover:bg-navy-700/50">
                        <td className="px-4 py-2">
                          <Link
                            href={`/category/${catId}`}
                            className="text-sm text-navy dark:text-cream hover:text-gold transition-colors"
                          >
                            {categoryNames[catId]}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span style={{ color: getScoreColor(currentScore) }} className="font-medium">
                            {currentScore}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span style={{ color: getScoreColor(projectedScore) }} className="font-medium">
                            {projectedScore}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {change !== 0 ? (
                            <span
                              className={`font-medium ${
                                change > 0 ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {change > 0 ? '+' : ''}{change}
                            </span>
                          ) : (
                            <span className="text-navy/30 dark:text-cream/30">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Domain Scores */}
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10 p-4">
            <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">Domain Scores</h2>
            <div className="space-y-3">
              {(Object.keys(domainNames) as DomainId[]).map((domain) => {
                const currentDomain = current.domainScores[domain];
                const projectedDomain = projected.domainScores[domain];
                const change = Math.round((projectedDomain - currentDomain) * 100) / 100;

                return (
                  <div key={domain} className="flex items-center justify-between">
                    <span className="text-sm text-navy dark:text-cream">{domainNames[domain]}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-navy/60 dark:text-cream/60">
                        {currentDomain.toFixed(1)}
                      </span>
                      <span className="text-navy/40 dark:text-cream/40">→</span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: getScoreColor(projectedDomain) }}
                      >
                        {projectedDomain.toFixed(1)}
                      </span>
                      {change !== 0 && (
                        <span
                          className={`text-xs font-medium ${
                            change > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          ({change > 0 ? '+' : ''}{change.toFixed(1)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
