import { Suspense } from 'react';
import { ActionsPushbackData } from '@/lib/types';
import ActionsPushbackDashboard from '@/components/actions/ActionsPushbackDashboard';
import actionsPushbackData from '@/data/actions-pushback.json';

export default function ActionsPushbackPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8 text-navy/50 dark:text-cream/50">Loading...</div>}>
      <ActionsPushbackDashboard
        data={actionsPushbackData as ActionsPushbackData}
      />
    </Suspense>
  );
}
