import { ActionsPushbackData } from '@/lib/types';
import ActionsPushbackDashboard from '@/components/actions/ActionsPushbackDashboard';
import actionsPushbackData from '@/data/actions-pushback.json';

export default function ActionsPushbackPage() {
  return (
    <ActionsPushbackDashboard
      data={actionsPushbackData as ActionsPushbackData}
    />
  );
}
