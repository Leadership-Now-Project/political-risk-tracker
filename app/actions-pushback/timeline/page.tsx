import Link from 'next/link';
import { ActionsTimelineData } from '@/lib/types';
import TimelineView from '@/components/actions/TimelineView';
import timelineData from '@/data/actions-timeline.json';

export default function TimelinePage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-navy/60 dark:text-cream/60">
        <Link href="/" className="hover:text-gold transition-colors">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link href="/actions-pushback" className="hover:text-gold transition-colors">
          Actions &amp; Pushback
        </Link>
        <span className="mx-2">/</span>
        <span className="text-navy dark:text-cream">Timeline</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-cream">
          Weekly Timeline
        </h1>
        <p className="mt-2 text-navy/70 dark:text-cream/70">
          Week-by-week chronology of executive actions and institutional responses
        </p>
      </div>

      {/* Timeline */}
      <TimelineView data={timelineData as ActionsTimelineData} />

      {/* Back link */}
      <div className="pt-4">
        <Link
          href="/actions-pushback"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-medium"
        >
          <span>&larr;</span>
          <span>Back to Actions &amp; Pushback</span>
        </Link>
      </div>
    </div>
  );
}
