'use client';

import Link from 'next/link';
import { Action } from '@/lib/types';
import { getActionStatusColor, getActionTypeLabel, getCategoryLabel } from '@/lib/actions-utils';
import StatusBadge from './StatusBadge';

interface ActionCardProps {
  action: Action;
  pushbackCount?: number;
}

export default function ActionCard({ action, pushbackCount }: ActionCardProps) {
  const colors = getActionStatusColor(action.status);
  const count = pushbackCount ?? action.pushbackIds.length;

  return (
    <Link href={`/actions-pushback/action/${action.id}`}>
      <div
        className={`relative p-4 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-navy-600 hover:shadow-ln-medium transition-all duration-200 cursor-pointer group shadow-ln-light`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-navy dark:text-cream group-hover:text-gold transition-colors">
              {action.title}
            </h3>
            <p className="text-xs text-navy/60 dark:text-cream/60 mt-1 line-clamp-2">
              {action.description}
            </p>
          </div>
          <StatusBadge status={action.status} variant="action" size="sm" />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gold/10 text-gold">
            {getActionTypeLabel(action.type)}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-navy/10 dark:bg-cream/10 text-navy/70 dark:text-cream/70">
            {getCategoryLabel(action.category)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy/10 dark:border-cream/10">
          <div className="flex items-center gap-2 text-xs text-navy/60 dark:text-cream/60">
            <span>{action.agencies.slice(0, 2).join(', ')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-navy/60 dark:text-cream/60">
            {count > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                {count} challenge{count !== 1 ? 's' : ''}
              </span>
            )}
            <span>{action.dateIssued}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
