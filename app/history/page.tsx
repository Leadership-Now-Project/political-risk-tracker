'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CategoriesData,
  CurrentAssessment,
  HistoricalSnapshot,
  ChartDataPoint,
  DomainId,
} from '@/lib/types';
import { getRiskLevel, getRiskLevelColor } from '@/lib/risk-levels';
import { getDomainInfo } from '@/lib/scoring';
import TrendChart from '@/components/TrendChart';
import RiskLevelBadge from '@/components/RiskLevelBadge';
import categoriesData from '@/data/categories.json';
import currentData from '@/data/current.json';
import history202507 from '@/data/history/2025-07-20.json';
import history202508 from '@/data/history/2025-08-20.json';
import history202509 from '@/data/history/2025-09-20.json';
import history202510 from '@/data/history/2025-10-20.json';
import history202511 from '@/data/history/2025-11-20.json';
import history202512 from '@/data/history/2025-12-20.json';

const categoryColors: Record<string, string> = {
  elections: '#ef4444',
  'rule-of-law': '#f97316',
  'national-security': '#eab308',
  'regulatory-stability': '#84cc16',
  'trade-policy': '#22c55e',
  'government-contracts': '#14b8a6',
  'fiscal-policy': '#06b6d4',
  'media-freedom': '#3b82f6',
  'civil-discourse': '#8b5cf6',
  'institutional-integrity': '#ec4899',
};

export default function HistoryPage() {
  const { categories } = categoriesData as CategoriesData;
  const current = currentData as CurrentAssessment;
  const [selectedDomain, setSelectedDomain] = useState<DomainId | 'all'>('all');

  const historicalSnapshots: HistoricalSnapshot[] = [
    history202507 as HistoricalSnapshot,
    history202508 as HistoricalSnapshot,
    history202509 as HistoricalSnapshot,
    history202510 as HistoricalSnapshot,
    history202511 as HistoricalSnapshot,
    history202512 as HistoricalSnapshot,
  ];

  // Build chart data for all categories
  const allChartData: ChartDataPoint[] = [
    ...historicalSnapshots.map((h) => {
      const point: ChartDataPoint = { date: h.date.slice(5) };
      categories.forEach((cat) => {
        point[cat.id] = h.scores[cat.id] || 0;
      });
      point.overall = h.overallScore;
      return point;
    }),
    (() => {
      const point: ChartDataPoint = { date: current.assessmentDate.slice(5) };
      categories.forEach((cat) => {
        point[cat.id] = current.scores[cat.id]?.score || 0;
      });
      point.overall = current.overallScore;
      return point;
    })(),
  ];

  // Filter categories by domain
  const filteredCategories =
    selectedDomain === 'all'
      ? categories
      : categories.filter((c) => c.domain === selectedDomain);

  const chartCategories = filteredCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: categoryColors[cat.id] || '#6b7280',
  }));

  const domains: { id: DomainId | 'all'; name: string }[] = [
    { id: 'all', name: 'All Categories' },
    { id: 'rule-of-law', name: 'Rule of Law & National Security' },
    { id: 'operating-economic', name: 'Operating & Economic Environment' },
    { id: 'societal-institutional', name: 'Societal & Institutional Integrity' },
  ];

  // Build comparison table data
  const tableData = filteredCategories.map((cat) => {
    const oldestScore = historicalSnapshots[0]?.scores[cat.id] || 0;
    const currentScore = current.scores[cat.id]?.score || 0;
    const change = currentScore - oldestScore;
    return {
      id: cat.id,
      name: cat.name,
      domain: cat.domain,
      oldestScore,
      currentScore,
      change,
      trend: current.scores[cat.id]?.trend || 'stable',
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-cream">Historical View</h1>
        <p className="mt-2 text-navy/70 dark:text-cream/70">
          Track risk score changes across all categories over time
        </p>
      </div>

      {/* Domain Filter */}
      <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-4 border border-navy/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-navy dark:text-cream mr-2">
            Filter by Domain:
          </span>
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedDomain === domain.id
                  ? 'bg-navy text-white'
                  : 'bg-cream dark:bg-navy-700 text-navy dark:text-cream hover:bg-gold/20'
              }`}
            >
              {domain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Score Trend */}
      <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
        <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
          Overall Risk Score Trend
        </h2>
        <TrendChart
          data={allChartData}
          categories={[{ id: 'overall', name: 'Overall Score', color: '#BDAA77' }]}
          height={200}
        />
      </div>

      {/* Category Trends Chart */}
      <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
        <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
          {selectedDomain === 'all'
            ? 'All Categories Trend'
            : `${getDomainInfo(selectedDomain).name} Trend`}
        </h2>
        <TrendChart data={allChartData} categories={chartCategories} height={400} />
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light overflow-hidden border border-navy/10">
        <div className="p-6 border-b border-navy/10">
          <h2 className="text-lg font-semibold text-navy dark:text-cream">
            Score Comparison (July 2025 vs Current)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream dark:bg-navy-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy/60 dark:text-cream/60 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-navy/60 dark:text-cream/60 uppercase tracking-wider">
                  Jul 2025
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-navy/60 dark:text-cream/60 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-navy/60 dark:text-cream/60 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-navy/60 dark:text-cream/60 uppercase tracking-wider">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10 dark:divide-cream/10">
              {tableData.map((row) => {
                const riskLevel = getRiskLevel(row.currentScore);
                const colors = getRiskLevelColor(riskLevel);
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-cream dark:hover:bg-navy-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/category/${row.id}`}
                        className="text-navy dark:text-cream font-medium hover:text-gold transition-colors"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center text-navy/70 dark:text-cream/70">
                      {row.oldestScore.toFixed(1)}
                    </td>
                    <td className={`px-6 py-4 text-center font-semibold ${colors.text}`}>
                      {row.currentScore.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-medium ${
                          row.change > 0
                            ? 'text-risk-high'
                            : row.change < 0
                            ? 'text-risk-low'
                            : 'text-navy/50 dark:text-cream/50'
                        }`}
                      >
                        {row.change > 0 ? '+' : ''}
                        {row.change.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <RiskLevelBadge level={riskLevel} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
  );
}
