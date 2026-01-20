'use client';

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
  // If showing a single category, just use that one
  const categoriesToShow = showSingleCategory
    ? [{ id: showSingleCategory, name: showSingleCategory, color: '#BDAA77' }]
    : categories;

  return (
    <div className="w-full bg-white dark:bg-navy-600 rounded-lg p-4">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D1D7E1" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#0E2344' }}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12, fill: '#0E2344' }}
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
