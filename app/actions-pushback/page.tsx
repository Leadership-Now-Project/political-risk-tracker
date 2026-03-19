import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { ActionsPushbackData } from '@/lib/types';
import ActionsPushbackDashboard from '@/components/actions/ActionsPushbackDashboard';
import actionsPushbackData from '@/data/actions-pushback.json';
import siteConfig from '@/data/site-config.json';

export default function ActionsPushbackPage() {
  if (!siteConfig.pages['actions-pushback'].enabled) {
    redirect('/');
  }

  return (
    <Suspense fallback={<div className="animate-pulse p-8 text-navy/50 dark:text-cream/50">Loading...</div>}>
      <ActionsPushbackDashboard
        data={actionsPushbackData as ActionsPushbackData}
      />
    </Suspense>
  );
}
