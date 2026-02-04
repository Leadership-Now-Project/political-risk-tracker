'use client';

import { ActionStatus, CaseStatus } from '@/lib/types';
import { getActionStatusColor, getActionStatusLabel, getCaseStatusColor, getCaseStatusLabel } from '@/lib/actions-utils';

interface StatusBadgeProps {
  status: ActionStatus | CaseStatus;
  variant: 'action' | 'case';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, variant, size = 'md' }: StatusBadgeProps) {
  const colors = variant === 'action'
    ? getActionStatusColor(status as ActionStatus)
    : getCaseStatusColor(status as CaseStatus);

  const label = variant === 'action'
    ? getActionStatusLabel(status as ActionStatus)
    : getCaseStatusLabel(status as CaseStatus);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${colors.bg} ${colors.text} ${colors.border} border ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
