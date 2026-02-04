'use client';

import Link from 'next/link';
import { Pushback } from '@/lib/types';
import { getPushbackTypeLabel } from '@/lib/actions-utils';
import StatusBadge from './StatusBadge';

interface PushbackTableProps {
  pushback: Pushback[];
  sortBy: 'date' | 'status' | 'type';
  onSortChange: (sortBy: 'date' | 'status' | 'type') => void;
}

export default function PushbackTable({ pushback, sortBy, onSortChange }: PushbackTableProps) {
  const headers: { key: 'date' | 'status' | 'type'; label: string }[] = [
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Filed Date' },
  ];

  return (
    <div className="overflow-x-auto bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10">
      <table className="w-full">
        <thead>
          <tr className="bg-cream dark:bg-navy-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-navy/70 dark:text-cream/70 uppercase tracking-wider">
              Title
            </th>
            {headers.map((header) => (
              <th
                key={header.key}
                onClick={() => onSortChange(header.key)}
                className="px-4 py-3 text-left text-xs font-semibold text-navy/70 dark:text-cream/70 uppercase tracking-wider cursor-pointer hover:text-gold transition-colors"
              >
                <span className="flex items-center gap-1">
                  {header.label}
                  {sortBy === header.key && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-semibold text-navy/70 dark:text-cream/70 uppercase tracking-wider">
              Court
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10 dark:divide-cream/10">
          {pushback.map((item) => (
            <tr key={item.id} className="hover:bg-cream/50 dark:hover:bg-navy-700/50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/actions-pushback/case/${item.id}`}
                  className="text-sm font-medium text-navy dark:text-cream hover:text-gold transition-colors"
                >
                  {item.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-navy/70 dark:text-cream/70">
                {getPushbackTypeLabel(item.type)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.caseStatus} variant="case" size="sm" />
              </td>
              <td className="px-4 py-3 text-sm text-navy/60 dark:text-cream/60 whitespace-nowrap">
                {item.dateFiled}
              </td>
              <td className="px-4 py-3 text-sm text-navy/60 dark:text-cream/60">
                {item.court || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
