'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ActionCategorySummary } from '@/lib/types';
import { getCategoryLabel } from '@/lib/actions-utils';

interface CategoryBarChartProps {
  data: ActionCategorySummary[];
}

const legendItems = [
  { label: 'Implemented', color: '#22c55e' },
  { label: 'Blocked', color: '#ef4444' },
  { label: 'Pending Litigation', color: '#f97316' },
];

export default function CategoryBarChart({ data }: CategoryBarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data
    .map((item) => ({
      name: getCategoryLabel(item.category),
      Implemented: item.implemented,
      Blocked: item.blocked,
      'Pending Litigation': item.pendingLitigation,
    }))
    .sort((a, b) => (b.Implemented + b.Blocked + b['Pending Litigation']) - (a.Implemented + a.Blocked + a['Pending Litigation']));

  const chartHeight = Math.max(400, data.length * 48);

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
              <CartesianGrid strokeDasharray="3 3" stroke="#D1D7E1" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: '#0E2344' }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#0E2344' }}
                width={160}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D7E1',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#0E2344' }}
                cursor={{ fill: 'rgba(189, 170, 119, 0.1)' }}
              />
              <Bar dataKey="Implemented" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Blocked" stackId="a" fill="#ef4444" />
              <Bar dataKey="Pending Litigation" stackId="a" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ width: '100%', height: chartHeight }} className="flex items-center justify-center bg-cream/50 dark:bg-navy-700/50 rounded-lg">
          <p className="text-navy/40 dark:text-cream/40 text-sm">Loading chart...</p>
        </div>
      )}
    </div>
  );
}
