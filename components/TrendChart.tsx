'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f43f5e', // rose-500
];

export default function TrendChart({
  data,
  categories,
  showSingleCategory,
  height = 300,
}: TrendChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const tickColor = isDark ? '#F8F6F1' : '#0E2344';
  const gridColor = isDark ? '#475F87' : '#D1D7E1';

  // If showing a single category, just use that one
  const categoriesToShow = showSingleCategory
    ? [{ id: showSingleCategory, name: showSingleCategory, color: '#BDAA77' }]
    : categories;

  return (
    <div className="w-full bg-white dark:bg-navy-600 rounded-lg p-4">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: tickColor }}
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
          />
          <Legend />
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
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
