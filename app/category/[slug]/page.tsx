import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoriesData, CurrentAssessment, HistoricalSnapshot, ChartDataPoint, ScenariosData, EconomicIndicatorsData, ActionsPushbackData } from '@/lib/types';
import { getRiskLevel, getRiskLevelColor, getTrendIcon, getTrendColor } from '@/lib/risk-levels';
import { getRubricTier, getDomainInfo, riskCategoryToActionCategories } from '@/lib/scoring';
import RiskGauge from '@/components/RiskGauge';
import RiskLevelBadge from '@/components/RiskLevelBadge';
import TrendChart from '@/components/TrendChart';
import RelatedContext from '@/components/RelatedContext';
import categoriesData from '@/data/categories.json';
import currentData from '@/data/current.json';
import scenariosData from '@/data/scenarios.json';
import economicData from '@/data/economic-indicators.json';
import actionsPushbackData from '@/data/actions-pushback.json';
import history202507 from '@/data/history/2025-07-20.json';
import history202508 from '@/data/history/2025-08-20.json';
import history202509 from '@/data/history/2025-09-20.json';
import history202510 from '@/data/history/2025-10-20.json';
import history202511 from '@/data/history/2025-11-20.json';
import history202512 from '@/data/history/2025-12-20.json';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { categories } = categoriesData as CategoriesData;
  const current = currentData as CurrentAssessment;

  const category = categories.find((c) => c.id === slug);
  if (!category) {
    notFound();
  }

  const score = current.scores[slug];
  if (!score) {
    notFound();
  }

  const riskLevel = getRiskLevel(score.score);
  const colors = getRiskLevelColor(riskLevel);
  const currentTier = getRubricTier(score.score);
  const domainInfo = getDomainInfo(category.domain);
  const trendIcon = getTrendIcon(score.trend);
  const trendColor = getTrendColor(score.trend);

  // Build historical data for chart
  const historicalSnapshots: HistoricalSnapshot[] = [
    history202507 as HistoricalSnapshot,
    history202508 as HistoricalSnapshot,
    history202509 as HistoricalSnapshot,
    history202510 as HistoricalSnapshot,
    history202511 as HistoricalSnapshot,
    history202512 as HistoricalSnapshot,
  ];

  const chartData: ChartDataPoint[] = [
    ...historicalSnapshots.map((h) => ({
      date: h.date.slice(5), // MM-DD format
      [slug]: h.scores[slug] || 0,
    })),
    {
      date: current.assessmentDate.slice(5),
      [slug]: score.score,
    },
  ];

  // Cross-link counts
  const scenarios = scenariosData as ScenariosData;
  const scenarioCount = scenarios.events.filter(
    e => e.category === slug || e.impacts.some(i => i.category === slug)
  ).length;

  const economic = economicData as EconomicIndicatorsData;
  const indicatorCount = economic.indicators.filter(
    i => i.sensitivity[slug] !== undefined
  ).length;

  const actionCategories = riskCategoryToActionCategories(slug);
  const actionsData = actionsPushbackData as ActionsPushbackData;
  const actionCount = actionCategories.length > 0
    ? actionsData.actions.filter(a => actionCategories.includes(a.category)).length
    : 0;
  const actionCategoryParams = actionCategories.map(c => `category=${c}`).join('&');

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-navy/60 dark:text-cream/60">
        <Link href="/" className="hover:text-gold transition-colors">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-navy dark:text-cream">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-navy rounded-xl shadow-ln-heavy p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium px-3 py-1 rounded bg-gold/20 text-gold uppercase tracking-wider">
                {domainInfo.name}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            <p className="mt-2 text-cream/80">{category.description}</p>
          </div>
          <div className="flex items-center gap-6">
            <RiskGauge score={score.score} size="lg" />
            <div className="text-center">
              <RiskLevelBadge level={riskLevel} size="lg" />
              <div className={`mt-2 flex items-center justify-center gap-1 ${trendColor} font-medium`}>
                <span className="text-lg">{trendIcon}</span>
                <span className="capitalize">{score.trend}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Rubric */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
              Scoring Rubric
            </h2>
            <div className="space-y-3">
              {Object.entries(category.rubric).map(([tier, description]) => {
                const isCurrentTier = tier === currentTier;
                return (
                  <div
                    key={tier}
                    className={`p-3 rounded-lg border-l-4 ${
                      isCurrentTier
                        ? `${colors.border} bg-gold/10`
                        : 'border-navy/10 bg-cream dark:bg-navy-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-bold ${
                          isCurrentTier ? colors.text : 'text-navy dark:text-cream'
                        }`}
                      >
                        {tier}
                      </span>
                      {isCurrentTier && (
                        <span className="text-xs font-semibold text-gold uppercase tracking-wider">Current</span>
                      )}
                    </div>
                    <p className="text-sm text-navy/70 dark:text-cream/70">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Key Findings and Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Findings */}
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
              Key Findings
            </h2>
            <ul className="space-y-3">
              {score.keyFindings.map((finding, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-gold text-white text-sm font-bold"
                  >
                    {index + 1}
                  </span>
                  <p className="text-navy/80 dark:text-cream/80">{finding}</p>
                </li>
              ))}
            </ul>
            {/* Sources */}
            {score.sources && score.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-navy/10">
                <h3 className="text-sm font-semibold text-navy dark:text-cream mb-2">Sources</h3>
                <ul className="space-y-1">
                  {score.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold hover:text-gold-dark hover:underline break-all"
                      >
                        {new URL(source).hostname.replace('www.', '')}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-sm text-navy/50 dark:text-cream/50">
              Last updated: {score.lastUpdated}
            </p>
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
              Historical Trend
            </h2>
            <TrendChart
              data={chartData}
              categories={[{ id: slug, name: category.name, color: colors.text.includes('green') ? '#22c55e' : colors.text.includes('yellow') ? '#eab308' : colors.text.includes('orange') ? '#f97316' : '#ef4444' }]}
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Related Analysis Cross-links */}
      <RelatedContext
        categorySlug={slug}
        scenarioCount={scenarioCount}
        indicatorCount={indicatorCount}
        actionCount={actionCount}
        actionCategoryParams={actionCategoryParams}
      />

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
  );
}

export async function generateStaticParams() {
  const { categories } = categoriesData as CategoriesData;
  return categories.map((category) => ({
    slug: category.id,
  }));
}
