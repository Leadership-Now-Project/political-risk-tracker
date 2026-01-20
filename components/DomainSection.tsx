'use client';

import { Category, CategoryScore, DomainId } from '@/lib/types';
import { getRiskLevel, getRiskLevelColor } from '@/lib/risk-levels';
import { getDomainInfo, formatScore } from '@/lib/scoring';
import RiskCard from './RiskCard';
import RiskLevelBadge from './RiskLevelBadge';

interface DomainSectionProps {
  domainId: DomainId;
  categories: Category[];
  scores: Record<string, CategoryScore>;
  domainScore: number;
}

export default function DomainSection({
  domainId,
  categories,
  scores,
  domainScore,
}: DomainSectionProps) {
  const domainInfo = getDomainInfo(domainId);
  const riskLevel = getRiskLevel(domainScore);
  const colors = getRiskLevelColor(riskLevel);

  // Filter categories for this domain
  const domainCategories = categories.filter((cat) => cat.domain === domainId);

  return (
    <section className="mb-8">
      {/* Domain Header */}
      <div className="p-4 rounded-t-lg border-l-4 border-gold bg-white dark:bg-navy-600 shadow-ln-light">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-navy dark:text-cream">
              {domainInfo.name}
            </h2>
            <p className="text-sm text-navy/70 dark:text-cream/70 mt-1">
              {domainInfo.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-navy/60 dark:text-cream/60 uppercase tracking-wider">
                Domain Average
              </p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {formatScore(domainScore)}
              </p>
            </div>
            <RiskLevelBadge level={riskLevel} size="md" />
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {domainCategories.map((category) => (
          <RiskCard
            key={category.id}
            category={category}
            score={scores[category.id]}
          />
        ))}
      </div>
    </section>
  );
}
