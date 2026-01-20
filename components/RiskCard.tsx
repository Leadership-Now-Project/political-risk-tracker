'use client';

import Link from 'next/link';
import { Category, CategoryScore } from '@/lib/types';
import { getRiskLevel, getTrendIcon, getTrendColor, getRiskLevelColor } from '@/lib/risk-levels';
import RiskGauge from './RiskGauge';
import RiskLevelBadge from './RiskLevelBadge';

interface RiskCardProps {
  category: Category;
  score: CategoryScore;
}

export default function RiskCard({ category, score }: RiskCardProps) {
  const riskLevel = getRiskLevel(score.score);
  const trendIcon = getTrendIcon(score.trend);
  const trendColor = getTrendColor(score.trend);
  const colors = getRiskLevelColor(riskLevel);

  return (
    <Link href={`/category/${category.id}`}>
      <div
        className={`relative p-4 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-navy-600 hover:shadow-ln-medium transition-all duration-200 cursor-pointer group shadow-ln-light`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-navy dark:text-cream group-hover:text-gold transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-navy/60 dark:text-cream/60 mt-1 line-clamp-2">
              {category.description}
            </p>
          </div>
          <RiskGauge score={score.score} size="sm" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy/10 dark:border-cream/10">
          <RiskLevelBadge level={riskLevel} size="sm" />
          <div className={`flex items-center gap-1 ${trendColor} font-medium text-sm`}>
            <span>{trendIcon}</span>
            <span className="capitalize">{score.trend}</span>
          </div>
        </div>

        {/* Last updated */}
        <p className="text-xs text-navy/40 dark:text-cream/40 mt-2">
          Updated: {score.lastUpdated}
        </p>
      </div>
    </Link>
  );
}
