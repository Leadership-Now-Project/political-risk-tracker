'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '@/lib/types';

interface TrendChartProps {
  data: ChartDataPoint[];
  categories?: { id: string; name: string; color: string }[];
  showSingleCategory?: string;
  height?: number;
}

const defaultColors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f43f5e',
];

function formatDate(value: number | string): string {
  const d = new Date(Number(value));
  if (isNaN(d.getTime())) return String(value);
  const month = d.getMonth() + 1;
  const day = String(d.getDate()).padStart(2, '0');
  const year = String(d.getFullYear()).slice(2);
  return `${month}/${day}/${year}`;
}

export default function TrendChart({
  data,
  categories,
  showSingleCategory,
  height = 300,
}: TrendChartProps) {
  const [isDark, setIsDark] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const tickColor = isDark ? '#F8F6F1' : '#0E2344';
  const gridColor = isDark ? '#475F87' : '#D1D7E1';

  const categoriesToShow = showSingleCategory
    ? [{ id: showSingleCategory, name: showSingleCategory, color: '#BDAA77' }]
    : categories;

  const showLegend = !showSingleCategory && categoriesToShow && categoriesToShow.length > 1;

  function toggleCategory(id: string) {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="w-full bg-white dark:bg-navy-600 rounded-lg p-4">
      {showLegend && (
        <div className="flex flex-wrap gap-x-3 gap-y-2 mb-4">
          {categoriesToShow!.map((cat, index) => {
            const color = cat.color || defaultColors[index % defaultColors.length];
            const isHidden = hiddenCategories.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-navy/5 dark:hover:bg-cream/5 transition-opacity transition-colors text-xs"
                style={{ opacity: isHidden ? 0.3 : 1 }}
              >
                <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
                  <line x1="0" y1="5" x2="16" y2="5" stroke={color} strokeWidth="2" />
                  <circle cx="8" cy="5" r="3" fill={color} />
                </svg>
                <span className="text-navy dark:text-cream font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 12, fill: tickColor }}
            tickFormatter={formatDate}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12, fill: tickColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0B1C36' : '#FFFFFF',
              border: `1px solid ${gridColor}`,
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
            }}
            labelStyle={{ fontWeight: 'bold', color: tickColor }}
            labelFormatter={formatDate}
          />
          {categoriesToShow?.map((cat, index) => (
            <Line
              key={cat.id}
              type="monotone"
              dataKey={cat.id}
              name={cat.name}
              stroke={cat.color || defaultColors[index % defaultColors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              hide={hiddenCategories.has(cat.id)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
