'use client';

import { RiskLevel } from '@/lib/types';
import { getRiskLevelColor } from '@/lib/risk-levels';

interface RiskLevelBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskLevelBadge({ level, size = 'md' }: RiskLevelBadgeProps) {
  const colors = getRiskLevelColor(level);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${colors.bg} ${colors.text} ${colors.border} border ${sizeClasses[size]}`}
    >
      {level}
    </span>
  );
}
