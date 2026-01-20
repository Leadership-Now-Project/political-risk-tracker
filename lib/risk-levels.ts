import { RiskLevel } from './types';

// Get risk level from score
export function getRiskLevel(score: number): RiskLevel {
  if (score < 3) return 'Low';
  if (score < 5) return 'Moderate';
  if (score < 7) return 'Elevated';
  if (score < 9) return 'High';
  return 'Severe';
}

// Get color classes for risk level (Tailwind classes)
export function getRiskLevelColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  gradient: string;
} {
  switch (level) {
    case 'Low':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
        gradient: 'from-green-500 to-green-600',
      };
    case 'Moderate':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
        gradient: 'from-yellow-500 to-yellow-600',
      };
    case 'Elevated':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-700',
        gradient: 'from-orange-500 to-orange-600',
      };
    case 'High':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
        gradient: 'from-red-500 to-red-600',
      };
    case 'Severe':
      return {
        bg: 'bg-red-200 dark:bg-red-900/50',
        text: 'text-red-900 dark:text-red-300',
        border: 'border-red-500 dark:border-red-600',
        gradient: 'from-red-700 to-red-900',
      };
  }
}

// Get score color for gauge (returns hex color)
export function getScoreColor(score: number): string {
  const level = getRiskLevel(score);
  switch (level) {
    case 'Low':
      return '#22c55e'; // green-500
    case 'Moderate':
      return '#eab308'; // yellow-500
    case 'Elevated':
      return '#f97316'; // orange-500
    case 'High':
      return '#ef4444'; // red-500
    case 'Severe':
      return '#991b1b'; // red-800
  }
}

// Get trend icon
export function getTrendIcon(trend: 'increasing' | 'stable' | 'decreasing'): string {
  switch (trend) {
    case 'increasing':
      return '↑';
    case 'stable':
      return '→';
    case 'decreasing':
      return '↓';
  }
}

// Get trend color classes
export function getTrendColor(trend: 'increasing' | 'stable' | 'decreasing'): string {
  switch (trend) {
    case 'increasing':
      return 'text-red-600 dark:text-red-400'; // Risk increasing is bad
    case 'stable':
      return 'text-gray-600 dark:text-gray-400';
    case 'decreasing':
      return 'text-green-600 dark:text-green-400'; // Risk decreasing is good
  }
}
