'use client';

import Link from 'next/link';
import { Action } from '@/lib/types';
import { getActionTypeLabel, getCategoryLabel } from '@/lib/actions-utils';
import StatusBadge from './StatusBadge';

interface ActionsTableProps {
  actions: Action[];
  sortBy: 'date' | 'status' | 'category' | 'type';
  onSortChange: (sortBy: 'date' | 'status' | 'category' | 'type') => void;
}

export default function ActionsTable({ actions, sortBy, onSortChange }: ActionsTableProps) {
  const headers: { key: 'date' | 'status' | 'category' | 'type'; label: string }[] = [
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' },
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
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10 dark:divide-cream/10">
          {actions.map((action) => (
            <tr key={action.id} className="hover:bg-cream/50 dark:hover:bg-navy-700/50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/actions-pushback/action/${action.id}`}
                  className="text-sm font-medium text-navy dark:text-cream hover:text-gold transition-colors"
                >
                  {action.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-navy/70 dark:text-cream/70">
                {getActionTypeLabel(action.type)}
              </td>
              <td className="px-4 py-3 text-sm text-navy/70 dark:text-cream/70">
                {getCategoryLabel(action.category)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={action.status} variant="action" size="sm" />
              </td>
              <td className="px-4 py-3 text-sm text-navy/60 dark:text-cream/60 whitespace-nowrap">
                {action.dateIssued}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
