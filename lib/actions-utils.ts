import { ActionStatus, CaseStatus, ActionType, PushbackType, ActionCategory, Action, Pushback } from './types';

// Color classes for action status
export function getActionStatusColor(status: ActionStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'implemented':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
      };
    case 'partially-implemented':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
      };
    case 'blocked':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
      };
    case 'reversed':
      return {
        bg: 'bg-red-200 dark:bg-red-900/50',
        text: 'text-red-900 dark:text-red-300',
        border: 'border-red-500 dark:border-red-600',
      };
    case 'pending-litigation':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-700',
      };
    case 'under-review':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-700',
      };
  }
}

// Color classes for case status
export function getCaseStatusColor(status: CaseStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'filed':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-700',
      };
    case 'preliminary-injunction':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
      };
    case 'injunction-granted':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
      };
    case 'injunction-denied':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
      };
    case 'ruling-against':
      return {
        bg: 'bg-red-200 dark:bg-red-900/50',
        text: 'text-red-900 dark:text-red-300',
        border: 'border-red-500 dark:border-red-600',
      };
    case 'ruling-for':
      return {
        bg: 'bg-green-200 dark:bg-green-900/50',
        text: 'text-green-900 dark:text-green-300',
        border: 'border-green-500 dark:border-green-600',
      };
    case 'appealed':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-700',
      };
    case 'settled':
      return {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-700',
      };
    case 'dismissed':
      return {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-700',
      };
  }
}

// Label helpers
export function getActionStatusLabel(status: ActionStatus): string {
  switch (status) {
    case 'implemented': return 'Implemented';
    case 'partially-implemented': return 'Partially Implemented';
    case 'blocked': return 'Blocked';
    case 'reversed': return 'Reversed';
    case 'pending-litigation': return 'Pending Litigation';
    case 'under-review': return 'Under Review';
  }
}

export function getCaseStatusLabel(status: CaseStatus): string {
  switch (status) {
    case 'filed': return 'Filed';
    case 'preliminary-injunction': return 'Preliminary Injunction';
    case 'injunction-granted': return 'Injunction Granted';
    case 'injunction-denied': return 'Injunction Denied';
    case 'ruling-against': return 'Ruling Against';
    case 'ruling-for': return 'Ruling For';
    case 'appealed': return 'Appealed';
    case 'settled': return 'Settled';
    case 'dismissed': return 'Dismissed';
  }
}

export function getActionTypeLabel(type: ActionType): string {
  switch (type) {
    case 'executive-order': return 'Executive Order';
    case 'presidential-memo': return 'Presidential Memo';
    case 'agency-rule': return 'Agency Rule';
    case 'policy-directive': return 'Policy Directive';
    case 'proclamation': return 'Proclamation';
    case 'signing-statement': return 'Signing Statement';
  }
}

export function getPushbackTypeLabel(type: PushbackType): string {
  switch (type) {
    case 'federal-lawsuit': return 'Federal Lawsuit';
    case 'state-lawsuit': return 'State Lawsuit';
    case 'congressional-action': return 'Congressional Action';
    case 'state-legislation': return 'State Legislation';
    case 'agency-resistance': return 'Agency Resistance';
    case 'judicial-ruling': return 'Judicial Ruling';
    case 'public-protest': return 'Public Protest';
  }
}

export function getCategoryLabel(category: ActionCategory): string {
  switch (category) {
    case 'immigration': return 'Immigration';
    case 'environment': return 'Environment';
    case 'civil-rights': return 'Civil Rights';
    case 'government-reform': return 'Government Reform';
    case 'economic-policy': return 'Economic Policy';
    case 'judiciary': return 'Judiciary';
    case 'healthcare': return 'Healthcare';
    case 'education': return 'Education';
    case 'foreign-policy': return 'Foreign Policy';
    case 'media-press': return 'Media & Press';
  }
}

// Search across actions and pushback
export function searchActionsAndPushback(
  actions: Action[],
  pushback: Pushback[],
  query: string
): { actions: Action[]; pushback: Pushback[] } {
  const q = query.toLowerCase().trim();
  if (!q) return { actions, pushback };

  const filteredActions = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.agencies.some((ag) => ag.toLowerCase().includes(q)) ||
      getCategoryLabel(a.category).toLowerCase().includes(q) ||
      getActionTypeLabel(a.type).toLowerCase().includes(q)
  );

  const filteredPushback = pushback.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.plaintiffs.some((pl) => pl.toLowerCase().includes(q)) ||
      (p.court && p.court.toLowerCase().includes(q)) ||
      getPushbackTypeLabel(p.type).toLowerCase().includes(q)
  );

  return { actions: filteredActions, pushback: filteredPushback };
}

// Filter by categories
export function filterByCategory(
  actions: Action[],
  pushback: Pushback[],
  categories: ActionCategory[]
): { actions: Action[]; pushback: Pushback[] } {
  if (categories.length === 0) return { actions, pushback };

  const filteredActions = actions.filter((a) => categories.includes(a.category));
  const actionIds = new Set(filteredActions.map((a) => a.id));
  const filteredPushback = pushback.filter((p) =>
    p.actionIds.some((id) => actionIds.has(id))
  );

  return { actions: filteredActions, pushback: filteredPushback };
}

// Sort actions
export function sortActions(
  actions: Action[],
  sortBy: 'date' | 'status' | 'category' | 'type',
  direction: 'asc' | 'desc' = 'desc'
): Action[] {
  const sorted = [...actions].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

// Sort pushback
export function sortPushback(
  pushback: Pushback[],
  sortBy: 'date' | 'status' | 'type',
  direction: 'asc' | 'desc' = 'desc'
): Pushback[] {
  const sorted = [...pushback].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.dateFiled).getTime() - new Date(b.dateFiled).getTime();
      case 'status':
        return a.caseStatus.localeCompare(b.caseStatus);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}
