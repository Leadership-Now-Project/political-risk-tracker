import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionsPushbackData } from '@/lib/types';
import { getPushbackTypeLabel, getCaseStatusLabel } from '@/lib/actions-utils';
import StatusBadge from '@/components/actions/StatusBadge';
import ActionCard from '@/components/actions/ActionCard';
import actionsPushbackData from '@/data/actions-pushback.json';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = actionsPushbackData as ActionsPushbackData;

  const pushback = data.pushback.find((p) => p.id === id);
  if (!pushback) {
    notFound();
  }

  const relatedActions = data.actions.filter((a) => pushback.actionIds.includes(a.id));

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
        <span className="text-navy dark:text-cream">{pushback.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-navy rounded-xl shadow-ln-heavy p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium px-3 py-1 rounded bg-gold/20 text-gold uppercase tracking-wider">
                {getPushbackTypeLabel(pushback.type)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{pushback.title}</h1>
            <p className="mt-2 text-cream/80">{pushback.description}</p>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={pushback.caseStatus} variant="case" size="lg" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Info */}
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
              Case Details
            </h2>
            <p className="text-navy/80 dark:text-cream/80">{pushback.description}</p>
            <div className="mt-4 pt-4 border-t border-navy/10 dark:border-cream/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-navy/50 dark:text-cream/50 uppercase tracking-wider">Date Filed</p>
                <p className="text-sm text-navy dark:text-cream mt-1">{pushback.dateFiled}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy/50 dark:text-cream/50 uppercase tracking-wider">Status</p>
                <p className="text-sm text-navy dark:text-cream mt-1">{getCaseStatusLabel(pushback.caseStatus)}</p>
              </div>
              {pushback.court && (
                <div>
                  <p className="text-xs font-medium text-navy/50 dark:text-cream/50 uppercase tracking-wider">Court</p>
                  <p className="text-sm text-navy dark:text-cream mt-1">{pushback.court}</p>
                </div>
              )}
              {pushback.outcome && (
                <div>
                  <p className="text-xs font-medium text-navy/50 dark:text-cream/50 uppercase tracking-wider">Outcome</p>
                  <p className="text-sm text-navy dark:text-cream mt-1">{pushback.outcome}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Actions */}
          {relatedActions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
                Related Executive Actions ({relatedActions.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedActions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {pushback.sources.length > 0 && (
            <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
              <h2 className="text-sm font-semibold text-navy dark:text-cream mb-2">Sources</h2>
              <ul className="space-y-1">
                {pushback.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gold hover:text-gold-dark hover:underline break-all"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Plaintiffs */}
          <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light p-6 border border-navy/10">
            <h2 className="text-lg font-semibold text-navy dark:text-cream mb-4">
              Plaintiffs / Parties
            </h2>
            <ul className="space-y-2">
              {pushback.plaintiffs.map((plaintiff, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                  <span className="text-sm text-navy/80 dark:text-cream/80">{plaintiff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Back Link */}
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

export async function generateStaticParams() {
  const data = actionsPushbackData as ActionsPushbackData;
  return data.pushback.map((item) => ({
    id: item.id,
  }));
}
