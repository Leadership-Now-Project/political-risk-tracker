import { Category, CategoryScore, DomainId, DomainScores } from './types';

// Calculate domain average from category scores
export function calculateDomainScore(
  categories: Category[],
  scores: Record<string, CategoryScore>,
  domainId: DomainId
): number {
  const domainCategories = categories.filter((c) => c.domain === domainId);
  if (domainCategories.length === 0) return 0;

  const total = domainCategories.reduce((sum, cat) => {
    const score = scores[cat.id]?.score ?? 0;
    return sum + score;
  }, 0);

  return Math.round((total / domainCategories.length) * 100) / 100;
}

// Calculate all domain scores
export function calculateAllDomainScores(
  categories: Category[],
  scores: Record<string, CategoryScore>
): DomainScores {
  return {
    'rule-of-law': calculateDomainScore(categories, scores, 'rule-of-law'),
    'operating-economic': calculateDomainScore(categories, scores, 'operating-economic'),
    'societal-institutional': calculateDomainScore(categories, scores, 'societal-institutional'),
  };
}

// Calculate overall score (average of all categories)
export function calculateOverallScore(scores: Record<string, CategoryScore>): number {
  const scoreValues = Object.values(scores).map((s) => s.score);
  if (scoreValues.length === 0) return 0;

  const total = scoreValues.reduce((sum, score) => sum + score, 0);
  return Math.round((total / scoreValues.length) * 100) / 100;
}

// Get domain info
export function getDomainInfo(domainId: DomainId): { name: string; description: string } {
  switch (domainId) {
    case 'rule-of-law':
      return {
        name: 'Rule of Law & National Security',
        description:
          'Assesses the integrity of democratic institutions, electoral processes, and security apparatus.',
      };
    case 'operating-economic':
      return {
        name: 'Operating & Economic Environment',
        description:
          'Evaluates the business climate, regulatory stability, and economic policy predictability.',
      };
    case 'societal-institutional':
      return {
        name: 'Societal & Institutional Integrity',
        description:
          'Measures media freedom, civil discourse quality, and institutional independence.',
      };
  }
}

// Format score for display
export function formatScore(score: number): string {
  return score.toFixed(1);
}

// Get rubric tier for a score
export function getRubricTier(score: number): '1-2' | '3-4' | '5-6' | '7-8' | '9-10' {
  if (score <= 2) return '1-2';
  if (score <= 4) return '3-4';
  if (score <= 6) return '5-6';
  if (score <= 8) return '7-8';
  return '9-10';
}

// Calculate score change between two assessments
export function calculateScoreChange(
  currentScore: number,
  previousScore: number
): { change: number; direction: 'up' | 'down' | 'same' } {
  const change = Math.round((currentScore - previousScore) * 100) / 100;
  return {
    change: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
  };
}
