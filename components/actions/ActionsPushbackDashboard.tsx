'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ActionsPushbackData, ActionCategory } from '@/lib/types';
import { searchActionsAndPushback, filterByCategory, sortActions, sortPushback } from '@/lib/actions-utils';
import { useFilterParam, useFilterParamArray } from '@/hooks/useFilterParams';
import PageNav from '@/components/PageNav';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import ActionCard from './ActionCard';
import CaseCard from './CaseCard';
import ActionsTable from './ActionsTable';
import PushbackTable from './PushbackTable';

const CategoryBarChart = dynamic(() => import('./CategoryBarChart'), { ssr: false });

interface ActionsPushbackDashboardProps {
  data: ActionsPushbackData;
}

const allCategories: ActionCategory[] = [
  'immigration', 'environment', 'civil-rights', 'government-reform',
  'economic-policy', 'judiciary', 'healthcare', 'education', 'foreign-policy', 'media-press',
];

export default function ActionsPushbackDashboard({ data }: ActionsPushbackDashboardProps) {
  const [searchQuery, setSearchQuery] = useFilterParam('q', '');
  const [selectedCategories, setSelectedCategories] = useFilterParamArray('category');
  const [viewMode, setViewMode] = useFilterParam('view', 'cards');
  const [actionSortBy, setActionSortBy] = useFilterParam('sort', 'date');
  const [pushbackSortBy, setPushbackSortBy] = useFilterParam('psort', 'date');

  const filtered = useMemo(() => {
    let result = { actions: data.actions, pushback: data.pushback };
    result = filterByCategory(result.actions, result.pushback, selectedCategories as ActionCategory[]);
    result = searchActionsAndPushback(result.actions, result.pushback, searchQuery);
    return {
      actions: sortActions(result.actions, actionSortBy as 'date' | 'status' | 'category' | 'type'),
      pushback: sortPushback(result.pushback, pushbackSortBy as 'date' | 'status' | 'type'),
    };
  }, [data, searchQuery, selectedCategories, actionSortBy, pushbackSortBy]);

  const { summary } = data;

  const pageSections = [
    { id: 'summary', label: 'Summary' },
    { id: 'chart', label: 'By Category' },
    { id: 'actions', label: 'Actions' },
    { id: 'pushback', label: 'Pushback' },
  ];

  // Deduce which categories are actually present
  const presentCategories = allCategories.filter((cat) =>
    data.actions.some((a) => a.category === cat)
  );

  return (
    <>
      <PageNav sections={pageSections} />
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream">
            Actions &amp; Pushback Tracker
          </h1>
          <p className="mt-2 text-navy/70 dark:text-cream/70">
            Tracking executive actions and legal/institutional responses
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div id="summary" className="scroll-mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <p className="text-sm font-medium text-navy/60 dark:text-cream/60">Total Actions</p>
            <p className="text-3xl font-bold text-navy dark:text-cream mt-1">{summary.totalActions}</p>
          </div>
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <p className="text-sm font-medium text-navy/60 dark:text-cream/60">Legal Challenges</p>
            <p className="text-3xl font-bold text-navy dark:text-cream mt-1">{summary.totalLegalChallenges}</p>
          </div>
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <p className="text-sm font-medium text-navy/60 dark:text-cream/60">Blocked / Reversed</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{summary.blockedOrReversed}</p>
          </div>
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <p className="text-sm font-medium text-navy/60 dark:text-cream/60">Implementation Rate</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
              {Math.round(summary.implementationRate * 100)}%
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CategoryFilter
              categories={presentCategories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                    : 'bg-cream dark:bg-navy-700 text-navy/60 dark:text-cream/60'
                }`}
                aria-label="Card view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                    : 'bg-cream dark:bg-navy-700 text-navy/60 dark:text-cream/60'
                }`}
                aria-label="Table view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div id="chart" className="scroll-mt-20">
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
              Actions by Category
            </h2>
            <CategoryBarChart data={summary.categorySummaries} actions={data.actions} />
          </div>
        </div>

        {/* Actions Section */}
        <div id="actions" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy dark:text-cream">
              Executive Actions ({filtered.actions.length})
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="action-sort" className="text-sm text-navy/60 dark:text-cream/60">Sort by</label>
              <select
                id="action-sort"
                value={actionSortBy}
                onChange={(e) => setActionSortBy(e.target.value as typeof actionSortBy)}
                className="text-sm rounded-lg border border-navy/10 bg-white dark:bg-navy-700 text-navy dark:text-cream px-2 py-1"
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="category">Category</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.actions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          ) : (
            <ActionsTable
              actions={filtered.actions}
              sortBy={actionSortBy as 'date' | 'status' | 'category' | 'type'}
              onSortChange={setActionSortBy}
            />
          )}
          {filtered.actions.length === 0 && (
            <p className="text-center py-8 text-navy/50 dark:text-cream/50">
              No actions match your search or filter criteria.
            </p>
          )}
        </div>

        {/* Pushback Section */}
        <div id="pushback" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy dark:text-cream">
              Legal &amp; Institutional Pushback ({filtered.pushback.length})
            </h2>
          </div>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.pushback.map((item) => (
                <CaseCard key={item.id} pushback={item} />
              ))}
            </div>
          ) : (
            <PushbackTable
              pushback={filtered.pushback}
              sortBy={pushbackSortBy as 'date' | 'status' | 'type'}
              onSortChange={setPushbackSortBy}
            />
          )}
          {filtered.pushback.length === 0 && (
            <p className="text-center py-8 text-navy/50 dark:text-cream/50">
              No pushback entries match your search or filter criteria.
            </p>
          )}
        </div>

        {/* Timeline Link */}
        <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy dark:text-cream">
                Weekly Timeline
              </h2>
              <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
                View a week-by-week chronology of actions and responses
              </p>
            </div>
            <Link
              href="/actions-pushback/timeline"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-navy font-medium hover:bg-gold-dark transition-colors"
            >
              View Timeline
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
