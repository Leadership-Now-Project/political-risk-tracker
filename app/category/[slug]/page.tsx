import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CategoriesData, CurrentAssessment, HistoricalSnapshot, HistoricalChangesData,
  ScenariosData, EconomicIndicatorsData, ActionsPushbackData,
} from '@/lib/types';
import { getRiskLevel, getRiskLevelColor, getScoreColor, getTrendIcon, getTrendColor } from '@/lib/risk-levels';
import { getRubricTier, getDomainInfo, riskCategoryToActionCategories } from '@/lib/scoring';
import RiskGauge from '@/components/RiskGauge';
import RiskLevelBadge from '@/components/RiskLevelBadge';
import categoriesData from '@/data/categories.json';
import currentData from '@/data/current.json';
import scenariosData from '@/data/scenarios.json';
import economicData from '@/data/economic-indicators.json';
import actionsPushbackData from '@/data/actions-pushback.json';
import historicalChangesData from '@/data/historical-changes.json';
import history202507 from '@/data/history/2025-07-20.json';
import history202508 from '@/data/history/2025-08-20.json';
import history202509 from '@/data/history/2025-09-20.json';
import history202510 from '@/data/history/2025-10-20.json';
import history202511 from '@/data/history/2025-11-20.json';
import history202512 from '@/data/history/2025-12-20.json';
import history202601 from '@/data/history/2026-01-20.json';
import history202602 from '@/data/history/2026-02-20.json';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SVG sparkline for the header
function HeaderSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data) - 1;
  const max = Math.max(...data) + 1;
  const range = max - min || 1;
  const w = 160;
  const h = 48;
  const pad = 4;

  const points = data.map((val, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((val - min) / range) * (h - pad * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <defs>
        <linearGradient id="catSparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#catSparkGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[0].x} cy={points[0].y} r="2.5" fill={color} opacity="0.4" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={color} opacity="0.2" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
    </svg>
  );
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { categories } = categoriesData as CategoriesData;
  const current = currentData as CurrentAssessment;

  const category = categories.find((c) => c.id === slug);
  if (!category) notFound();

  const score = current.scores[slug];
  if (!score) notFound();

  const riskLevel = getRiskLevel(score.score);
  const colors = getRiskLevelColor(riskLevel);
  const scoreColor = getScoreColor(score.score);
  const currentTier = getRubricTier(score.score);
  const domainInfo = getDomainInfo(category.domain);
  const trendIcon = getTrendIcon(score.trend);
  const trendColor = getTrendColor(score.trend);

  // Historical snapshots for sparkline
  const historicalSnapshots: HistoricalSnapshot[] = [
    history202507 as HistoricalSnapshot,
    history202508 as HistoricalSnapshot,
    history202509 as HistoricalSnapshot,
    history202510 as HistoricalSnapshot,
    history202511 as HistoricalSnapshot,
    history202512 as HistoricalSnapshot,
    history202601 as HistoricalSnapshot,
    history202602 as HistoricalSnapshot,
  ];

  const sparklineData = [
    ...historicalSnapshots.map(h => h.scores[slug] || 0),
    score.score,
  ];

  // Previous score for delta
  const prevSnapshot = historicalSnapshots[historicalSnapshots.length - 1];
  const previousScore = prevSnapshot?.scores[slug] ?? score.score;
  const delta = score.score - previousScore;

  // Score evolution from historical-changes.json
  const histChanges = historicalChangesData as HistoricalChangesData;
  const scoreEvolution = histChanges.changes
    .map(change => {
      const catChange = change.categoryChanges.find(cc => cc.category === slug);
      const snapshotScore = historicalSnapshots.find(h => h.date === change.date)?.scores[slug];
      return {
        period: change.period,
        date: change.date,
        score: catChange ? catChange.to : snapshotScore ?? null,
        from: catChange?.from ?? null,
        to: catChange?.to ?? null,
        rationale: catChange?.rationale ?? null,
        changed: !!catChange,
      };
    })
    .filter(e => e.score !== null);

  // Related actions from actions-pushback
  const actionCategories = riskCategoryToActionCategories(slug);
  const actionsData = actionsPushbackData as ActionsPushbackData;
  const relatedActions = actionCategories.length > 0
    ? actionsData.actions.filter(a => actionCategories.includes(a.category))
    : [];
  const actionCategoryParams = actionCategories.map(c => `category=${c}`).join('&');

  // Action status breakdown
  const actionStatusCounts = relatedActions.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Related legal challenges
  const relatedPushback = actionsData.pushback.filter(p =>
    p.actionIds.some(aid => relatedActions.some(a => a.id === aid))
  );

  // Scenarios affecting this category
  const scenarios = scenariosData as ScenariosData;
  const relatedScenarios = scenarios.events.filter(
    e => e.category === slug || e.impacts.some(i => i.category === slug)
  );

  // Economic indicators sensitive to this category
  const economic = economicData as EconomicIndicatorsData;
  const sensitiveIndicators = economic.indicators
    .filter(ind => ind.sensitivity[slug] !== undefined)
    .map(ind => ({
      name: ind.name,
      weight: Math.abs(ind.sensitivity[slug].weight),
      description: ind.sensitivity[slug].description,
      value: ind.currentData.value,
      unit: ind.unit,
      yoyChange: ind.currentData.yearOverYearChange,
    }))
    .sort((a, b) => b.weight - a.weight);

  // Domain peer categories
  const peerCategories = categories
    .filter(c => c.domain === category.domain && c.id !== slug)
    .map(c => ({
      id: c.id,
      name: c.name,
      score: current.scores[c.id]?.score ?? 0,
    }));

  const domainScore = current.domainScores[category.domain];
  const domainColor = getScoreColor(domainScore);

  const statusLabels: Record<string, string> = {
    'implemented': 'Implemented',
    'partially-implemented': 'Partial',
    'blocked': 'Blocked',
    'reversed': 'Reversed',
    'pending-litigation': 'In Court',
    'under-review': 'Under Review',
  };

  const statusColors: Record<string, string> = {
    'implemented': 'bg-green-500/15 text-green-700 dark:text-green-400',
    'partially-implemented': 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    'blocked': 'bg-red-500/15 text-red-700 dark:text-red-400',
    'reversed': 'bg-red-500/15 text-red-700 dark:text-red-400',
    'pending-litigation': 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
    'under-review': 'bg-navy/10 text-navy/60 dark:bg-cream/10 dark:text-cream/60',
  };

  const likelihoodColors: Record<string, string> = {
    'low': 'bg-green-500/15 text-green-700 dark:text-green-400',
    'moderate': 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    'high': 'bg-red-500/15 text-red-700 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-navy/60 dark:text-cream/60">
        <Link href="/" className="hover:text-gold transition-colors">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-navy dark:text-cream">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-navy rounded-xl shadow-ln-heavy overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium px-3 py-1 rounded-md bg-gold/20 text-gold uppercase tracking-wider">
                  {domainInfo.name}
                </span>
                <div className={`flex items-center gap-1 ${trendColor} text-sm font-medium`}>
                  <span>{trendIcon}</span>
                  <span className="capitalize">{score.trend}</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{category.name}</h1>
              <p className="mt-2 text-cream/70 text-sm">{category.description}</p>
            </div>

            {/* Right: Gauge + Sparkline + Delta */}
            <div className="flex items-center gap-5">
              <div className="hidden md:block">
                <HeaderSparkline data={sparklineData} color={scoreColor} />
              </div>
              <div className="flex items-center gap-4">
                <RiskGauge score={score.score} size="lg" />
                <div className="text-center">
                  <RiskLevelBadge level={riskLevel} size="lg" />
                  {delta !== 0 && (
                    <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-md inline-block ${
                      delta > 0
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {delta > 0 ? '+' : ''}{delta} from last
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domain context bar */}
        <div className="px-6 md:px-8 py-3 bg-navy-700/50 border-t border-navy-400 flex items-center gap-6 text-xs overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-gold-light uppercase tracking-wider">Domain Avg</span>
            <span className="font-bold" style={{ color: domainColor }}>{domainScore.toFixed(1)}</span>
          </div>
          <div className="w-px h-3 bg-navy-400 flex-shrink-0" />
          {peerCategories.map(peer => (
            <Link
              key={peer.id}
              href={`/category/${peer.id}`}
              className="flex items-center gap-1.5 flex-shrink-0 hover:text-gold transition-colors"
            >
              <span className="text-cream/50">{peer.name}</span>
              <span className="font-bold" style={{ color: getScoreColor(peer.score) }}>{peer.score}</span>
            </Link>
          ))}
          <div className="w-px h-3 bg-navy-400 flex-shrink-0" />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-gold-light uppercase tracking-wider">Updated</span>
            <span className="text-white font-medium">{score.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Score Evolution Timeline */}
          <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 p-5">
            <h2 className="text-sm font-bold text-navy dark:text-cream uppercase tracking-wider mb-4">
              Score History
            </h2>
            <div className="space-y-0">
              {scoreEvolution.map((entry, i) => (
                <div key={entry.date} className="relative pl-6 pb-4 last:pb-0">
                  {/* Timeline line */}
                  {i < scoreEvolution.length - 1 && (
                    <div className="absolute left-[7px] top-3 bottom-0 w-px bg-navy/10 dark:bg-cream/10" />
                  )}
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${
                      entry.changed
                        ? 'border-transparent'
                        : 'border-navy/20 dark:border-cream/20 bg-white dark:bg-navy-600'
                    }`}
                    style={entry.changed ? {
                      backgroundColor: getScoreColor(entry.to!),
                      borderColor: getScoreColor(entry.to!),
                    } : {}}
                  />
                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-navy dark:text-cream">
                        {entry.period}
                      </span>
                      {entry.changed && entry.from !== null && entry.to !== null && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          entry.to > entry.from
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                            : 'bg-green-500/15 text-green-600 dark:text-green-400'
                        }`}>
                          {entry.from} → {entry.to}
                        </span>
                      )}
                      {!entry.changed && entry.score !== null && (
                        <span className="text-[10px] text-navy/30 dark:text-cream/30">
                          Score: {entry.score}
                        </span>
                      )}
                    </div>
                    {entry.rationale && (
                      <p className="text-xs text-navy/60 dark:text-cream/60 leading-relaxed">
                        {entry.rationale}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Rubric */}
          <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 p-5">
            <h2 className="text-sm font-bold text-navy dark:text-cream uppercase tracking-wider mb-4">
              Scoring Rubric
            </h2>
            <div className="space-y-2">
              {Object.entries(category.rubric).map(([tier, description]) => {
                const isCurrentTier = tier === currentTier;
                return (
                  <div
                    key={tier}
                    className={`p-3 rounded-lg border-l-[3px] ${
                      isCurrentTier
                        ? `${colors.border} bg-gold/10`
                        : 'border-navy/10 dark:border-cream/10 bg-cream/50 dark:bg-navy-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-bold ${
                          isCurrentTier ? colors.text : 'text-navy/50 dark:text-cream/50'
                        }`}
                      >
                        {tier}
                      </span>
                      {isCurrentTier && (
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-navy/60 dark:text-cream/60 leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Key Findings */}
          <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 p-5">
            <h2 className="text-sm font-bold text-navy dark:text-cream uppercase tracking-wider mb-4">
              Key Findings
            </h2>
            <div className="space-y-3">
              {score.keyFindings.map((finding, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ backgroundColor: scoreColor }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm text-navy/80 dark:text-cream/80 leading-relaxed">{finding}</p>
                </div>
              ))}
            </div>

            {/* Sources */}
            {score.sources && score.sources.length > 0 && (
              <div className="mt-5 pt-4 border-t border-navy/5 dark:border-cream/5">
                <h3 className="text-xs font-semibold text-navy/40 dark:text-cream/40 uppercase tracking-wider mb-2">Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {score.sources.map((source, index) => {
                    let hostname = '';
                    try { hostname = new URL(source).hostname.replace('www.', ''); } catch { hostname = source; }
                    return (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded-md bg-navy/5 dark:bg-cream/5 text-gold hover:bg-gold/10 transition-colors"
                      >
                        {hostname}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Executive Actions */}
          {relatedActions.length > 0 && (
            <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-navy dark:text-cream uppercase tracking-wider">
                  Related Executive Actions
                </h2>
                <Link
                  href={`/actions-pushback?${actionCategoryParams}`}
                  className="text-xs text-gold hover:text-gold-dark transition-colors"
                >
                  View all →
                </Link>
              </div>

              {/* Status breakdown bar */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="text-navy/40 dark:text-cream/40">{relatedActions.length} total</span>
                {Object.entries(actionStatusCounts).map(([status, count]) => (
                  <span key={status} className={`px-2 py-0.5 rounded-md font-medium ${statusColors[status] || ''}`}>
                    {count} {statusLabels[status] || status}
                  </span>
                ))}
              </div>

              {/* Legal challenge count */}
              {relatedPushback.length > 0 && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-navy/[0.03] dark:bg-cream/[0.03] text-xs">
                  <span className="font-semibold text-navy dark:text-cream">{relatedPushback.length}</span>
                  <span className="text-navy/50 dark:text-cream/50"> legal challenges filed against related actions</span>
                </div>
              )}

              {/* Recent actions list */}
              <div className="space-y-2">
                {relatedActions.slice(0, 5).map(action => (
                  <Link
                    key={action.id}
                    href={`/actions-pushback/action/${action.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-navy/[0.03] dark:hover:bg-cream/[0.03] transition-colors group"
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 ${statusColors[action.status] || ''}`}>
                      {statusLabels[action.status] || action.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-navy dark:text-cream group-hover:text-gold transition-colors block truncate">
                        {action.title}
                      </span>
                      <span className="text-xs text-navy/40 dark:text-cream/40">{action.dateIssued}</span>
                    </div>
                    <svg className="w-4 h-4 text-navy/15 dark:text-cream/15 group-hover:text-gold transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                {relatedActions.length > 5 && (
                  <Link
                    href={`/actions-pushback?${actionCategoryParams}`}
                    className="block text-center text-xs text-gold hover:text-gold-dark py-2"
                  >
                    + {relatedActions.length - 5} more actions
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Scenario Outlook */}
          {relatedScenarios.length > 0 && (
            <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-navy dark:text-cream uppercase tracking-wider">
                  Scenario Outlook
                </h2>
                <Link href="/scenarios" className="text-xs text-gold hover:text-gold-dark transition-colors">
                  All scenarios →
                </Link>
              </div>
              <div className="space-y-3">
                {relatedScenarios.map(scenario => {
                  const impactOnThis = scenario.impacts.find(i => i.category === slug);
                  const impactDelta = impactOnThis?.delta ?? 0;

                  return (
                    <div key={scenario.id} className="p-3 rounded-lg bg-navy/[0.02] dark:bg-cream/[0.02] border border-navy/5 dark:border-cream/5">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <span className="text-sm font-medium text-navy dark:text-cream leading-snug">
                          {scenario.label}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${likelihoodColors[scenario.likelihood] || ''}`}>
                            {scenario.likelihood}
                          </span>
                          {impactDelta !== 0 && (
                            <span className={`text-xs font-bold ${
                              impactDelta > 0 ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {impactDelta > 0 ? '+' : ''}{impactDelta}
                            </span>
                          )}
                        </div>
                      </div>
                      {impactOnThis?.reason && (
                        <p className="text-xs text-navy/50 dark:text-cream/50">{impactOnThis.reason}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Economic Sensitivity */}
          {sensitiveIndicators.length > 0 && (
            <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-navy dark:text-cream uppercase tracking-wider">
                  Economic Sensitivity
                </h2>
                <Link href="/economic-impact" className="text-xs text-gold hover:text-gold-dark transition-colors">
                  Full analysis →
                </Link>
              </div>
              <div className="space-y-2.5">
                {sensitiveIndicators.slice(0, 5).map(ind => (
                  <div key={ind.name} className="flex items-center gap-3">
                    {/* Sensitivity bar */}
                    <div className="w-16 flex-shrink-0">
                      <div className="w-full h-1.5 rounded-full bg-navy/5 dark:bg-cream/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${ind.weight * 100}%`,
                            backgroundColor: ind.weight >= 0.8 ? '#ef4444' : ind.weight >= 0.6 ? '#f97316' : '#eab308',
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-navy dark:text-cream w-32 flex-shrink-0">{ind.name}</span>
                    <span className="text-xs text-navy/50 dark:text-cream/50 flex-1 truncate">{ind.description}</span>
                    <span className={`text-xs font-semibold flex-shrink-0 ${
                      ind.yoyChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {ind.yoyChange > 0 ? '+' : ''}{ind.yoyChange}% YoY
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-medium text-sm"
        >
          <span>&larr;</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const { categories } = categoriesData as CategoriesData;
  return categories.map((category) => ({
    slug: category.id,
  }));
}
