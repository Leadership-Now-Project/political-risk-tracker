'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Action, ActionCategory, ActionCategorySummary } from '@/lib/types';
import { getCategoryLabel } from '@/lib/actions-utils';
import ActionCard from './ActionCard';

interface CategoryBarChartProps {
  data: ActionCategorySummary[];
  actions: Action[];
}

const legendItems = [
  { label: 'Implemented', color: '#22c55e' },
  { label: 'Blocked', color: '#ef4444' },
  { label: 'Pending Litigation', color: '#f97316' },
];

const statusToFilter: Record<string, string[]> = {
  'Implemented': ['implemented'],
  'Blocked': ['blocked', 'reversed'],
  'Pending Litigation': ['pending-litigation'],
};

const statusColors: Record<string, string> = {
  'Implemented': '#22c55e',
  'Blocked': '#ef4444',
  'Pending Litigation': '#f97316',
};

export default function CategoryBarChart({ data, actions }: CategoryBarChartProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const tickColor = isDark ? '#F8F6F1' : '#0E2344';
  const gridColor = isDark ? '#475F87' : '#D1D7E1';

  const chartData = data
    .map((item) => ({
      name: getCategoryLabel(item.category),
      category: item.category,
      Implemented: item.implemented,
      Blocked: item.blocked,
      'Pending Litigation': item.pendingLitigation,
    }))
    .sort((a, b) => (b.Implemented + b.Blocked + b['Pending Litigation']) - (a.Implemented + a.Blocked + a['Pending Litigation']));

  // Reverse lookup: display label → ActionCategory slug
  const labelToCategory = useMemo(() => {
    const map = new Map<string, ActionCategory>();
    data.forEach((item) => {
      map.set(getCategoryLabel(item.category), item.category);
    });
    return map;
  }, [data]);

  const chartHeight = Math.max(400, data.length * 48);

  const handleBarClick = (statusKey: string, entry: { name?: string }) => {
    const categoryName = entry.name;
    if (!categoryName) return;
    if (selectedCategory === categoryName && selectedStatus === statusKey) {
      setSelectedCategory(null);
      setSelectedStatus(null);
    } else {
      setSelectedCategory(categoryName);
      setSelectedStatus(statusKey);
    }
  };

  // Filter actions for the detail panel
  const filteredActions = useMemo(() => {
    if (!selectedCategory || !selectedStatus) return [];
    const categorySlug = labelToCategory.get(selectedCategory);
    if (!categorySlug) return [];
    const validStatuses = statusToFilter[selectedStatus] ?? [];
    return actions.filter(
      (a) => a.category === categorySlug && validStatuses.includes(a.status)
    );
  }, [selectedCategory, selectedStatus, actions, labelToCategory]);

  const isSelected = selectedCategory !== null && selectedStatus !== null;

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0 inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-navy/70 dark:text-cream/70">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      {mounted ? (
        <div style={{ width: '100%', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: tickColor }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: tickColor }}
                width={160}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0B1C36' : '#FFFFFF',
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                }}
                labelStyle={{ fontWeight: 'bold', color: tickColor }}
                cursor={{ fill: 'rgba(189, 170, 119, 0.1)' }}
              />
              {(['Implemented', 'Blocked', 'Pending Litigation'] as const).map((statusKey, idx) => (
                <Bar
                  key={statusKey}
                  dataKey={statusKey}
                  stackId="a"
                  fill={statusColors[statusKey]}
                  radius={idx === 2 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                  cursor="pointer"
                  onClick={(entry) => handleBarClick(statusKey, entry)}
                >
                  {chartData.map((row) => {
                    const dimmed =
                      isSelected &&
                      !(row.name === selectedCategory && statusKey === selectedStatus);
                    return (
                      <Cell
                        key={row.name}
                        fillOpacity={dimmed ? 0.3 : 1}
                      />
                    );
                  })}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ width: '100%', height: chartHeight }} className="flex items-center justify-center bg-cream/50 dark:bg-navy-700/50 rounded-lg">
          <p className="text-navy/40 dark:text-cream/40 text-sm">Loading chart...</p>
        </div>
      )}

      {/* Detail Panel */}
      {isSelected && (
        <div className="bg-cream/50 dark:bg-navy-700/50 rounded-lg p-4 mt-4 border border-navy/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-navy dark:text-cream">
                {selectedCategory}
              </h3>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: statusColors[selectedStatus!] }}
              >
                {selectedStatus}
              </span>
              <span className="text-sm text-navy/60 dark:text-cream/60">
                {filteredActions.length} action{filteredActions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedStatus(null); }}
              className="p-1 rounded-md hover:bg-navy/10 dark:hover:bg-cream/10 transition-colors text-navy/60 dark:text-cream/60"
              aria-label="Close detail panel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {filteredActions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-navy/50 dark:text-cream/50 text-sm">
              No actions found for this category and status.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
