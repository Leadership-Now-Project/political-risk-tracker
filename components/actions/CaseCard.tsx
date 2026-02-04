'use client';

import Link from 'next/link';
import { Pushback } from '@/lib/types';
import { getCaseStatusColor, getPushbackTypeLabel } from '@/lib/actions-utils';
import StatusBadge from './StatusBadge';

interface CaseCardProps {
  pushback: Pushback;
}

export default function CaseCard({ pushback }: CaseCardProps) {
  const colors = getCaseStatusColor(pushback.caseStatus);

  return (
    <Link href={`/actions-pushback/case/${pushback.id}`}>
      <div
        className={`relative p-4 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-navy-600 hover:shadow-ln-medium transition-all duration-200 cursor-pointer group shadow-ln-light`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-navy dark:text-cream group-hover:text-gold transition-colors">
              {pushback.title}
            </h3>
            <p className="text-xs text-navy/60 dark:text-cream/60 mt-1 line-clamp-2">
              {pushback.description}
            </p>
          </div>
          <StatusBadge status={pushback.caseStatus} variant="case" size="sm" />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gold/10 text-gold">
            {getPushbackTypeLabel(pushback.type)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy/10 dark:border-cream/10">
          <div className="text-xs text-navy/60 dark:text-cream/60">
            {pushback.court && <span>{pushback.court}</span>}
            {!pushback.court && <span>{pushback.plaintiffs.slice(0, 2).join(', ')}</span>}
          </div>
          <span className="text-xs text-navy/60 dark:text-cream/60">{pushback.dateFiled}</span>
        </div>
      </div>
    </Link>
  );
}
