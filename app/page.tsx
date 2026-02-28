import { CategoriesData, CurrentAssessment, StatesData, ActionsPushbackData, HistoricalSnapshot, HistoricalChangesData } from '@/lib/types';
import Dashboard from '@/components/Dashboard';
import categoriesData from '@/data/categories.json';
import currentData from '@/data/current.json';
import statesData from '@/data/states.json';
import actionsPushbackData from '@/data/actions-pushback.json';
import previousSnapshot from '@/data/history/2026-02-20.json';
import historicalChangesData from '@/data/historical-changes.json';

// All history snapshots for sparklines
import history202507 from '@/data/history/2025-07-20.json';
import history202508 from '@/data/history/2025-08-20.json';
import history202509 from '@/data/history/2025-09-20.json';
import history202510 from '@/data/history/2025-10-20.json';
import history202511 from '@/data/history/2025-11-20.json';
import history202512 from '@/data/history/2025-12-20.json';
import history202601 from '@/data/history/2026-01-20.json';
import history202602 from '@/data/history/2026-02-20.json';

const historicalSnapshots: HistoricalSnapshot[] = [
  history202507 as HistoricalSnapshot,
  history202508 as HistoricalSnapshot,
  history202509 as HistoricalSnapshot,
  history202510 as HistoricalSnapshot,
  history202511 as HistoricalSnapshot,
  history202512 as HistoricalSnapshot,
  history202601 as HistoricalSnapshot,
  history202602 as HistoricalSnapshot,
];

export default function Home() {
  return (
    <Dashboard
      categoriesData={categoriesData as CategoriesData}
      currentData={currentData as CurrentAssessment}
      statesData={statesData as StatesData}
      actionsPushbackData={actionsPushbackData as ActionsPushbackData}
      previousSnapshot={previousSnapshot as HistoricalSnapshot}
      historicalChanges={historicalChangesData as HistoricalChangesData}
      historicalSnapshots={historicalSnapshots}
    />
  );
}
