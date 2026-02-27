import Link from 'next/link';

interface RelatedContextProps {
  categorySlug: string;
  scenarioCount: number;
  indicatorCount: number;
  actionCount: number;
  actionCategoryParams: string;
}

export default function RelatedContext({
  scenarioCount,
  indicatorCount,
  actionCount,
  actionCategoryParams,
}: RelatedContextProps) {
  return (
    <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
      <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
        Related Analysis
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/scenarios"
          className="p-4 rounded-lg border border-navy/10 hover:border-gold/50 hover:bg-gold/5 transition-all group"
        >
          <div className="text-2xl font-bold text-navy dark:text-cream">{scenarioCount}</div>
          <div className="text-sm text-navy/60 dark:text-cream/60">Related Scenarios</div>
          <div className="text-xs text-gold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View scenarios →
          </div>
        </Link>

        <Link
          href="/economic-impact"
          className="p-4 rounded-lg border border-navy/10 hover:border-gold/50 hover:bg-gold/5 transition-all group"
        >
          <div className="text-2xl font-bold text-navy dark:text-cream">{indicatorCount}</div>
          <div className="text-sm text-navy/60 dark:text-cream/60">Affected Indicators</div>
          <div className="text-xs text-gold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View impact →
          </div>
        </Link>

        {actionCount > 0 && (
          <Link
            href={`/actions-pushback?${actionCategoryParams}`}
            className="p-4 rounded-lg border border-navy/10 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="text-2xl font-bold text-navy dark:text-cream">{actionCount}</div>
            <div className="text-sm text-navy/60 dark:text-cream/60">Executive Actions</div>
            <div className="text-xs text-gold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              View actions →
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
