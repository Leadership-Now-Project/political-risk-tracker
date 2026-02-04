'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ActionCategorySummary } from '@/lib/types';
import { getCategoryLabel } from '@/lib/actions-utils';

interface CategoryBarChartProps {
  data: ActionCategorySummary[];
}

export default function CategoryBarChart({ data }: CategoryBarChartProps) {
  const chartData = data.map((item) => ({
    name: getCategoryLabel(item.category),
    Implemented: item.implemented,
    Blocked: item.blocked,
    'Pending Litigation': item.pendingLitigation,
  }));

  return (
    <div className="w-full bg-white dark:bg-navy-600 rounded-lg p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#D1D7E1" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#0E2344' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#0E2344' }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D7E1',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
            }}
            labelStyle={{ fontWeight: 'bold', color: '#0E2344' }}
          />
          <Legend />
          <Bar dataKey="Implemented" stackId="a" fill="#22c55e" />
          <Bar dataKey="Blocked" stackId="a" fill="#ef4444" />
          <Bar dataKey="Pending Litigation" stackId="a" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
