import Link from 'next/link';
import currentData from '@/data/current.json';
import categoriesData from '@/data/categories.json';
import { CurrentAssessment, CategoriesData } from '@/lib/types';
import { getScoreColor, getRiskLevel } from '@/lib/risk-levels';

const current = currentData as CurrentAssessment;
const categories = (categoriesData as CategoriesData).categories;

const quickActions = [
  { href: '/admin/scores', label: 'Edit Scores', description: 'Update category scores, findings, and sources', color: '#3b82f6' },
  { href: '/admin/scenarios', label: 'Manage Scenarios', description: 'Add, edit, or remove forward-looking scenarios', color: '#8b5cf6' },
  { href: '/admin/actions', label: 'Actions & Pushback', description: 'Track executive actions and legal challenges', color: '#f59e0b' },
  { href: '/admin/snapshot', label: 'Monthly Snapshot', description: 'Create a point-in-time history archive', color: '#10b981' },
  { href: '/admin/weekly-update', label: 'AI Weekly Update', description: 'Run AI-assisted research and scoring', color: '#ec4899' },
];

export default function AdminDashboard() {
  const overallColor = getScoreColor(current.overallScore);
  const riskLevel = getRiskLevel(current.overallScore);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cream">Dashboard</h1>
        <p className="text-cream/40 text-sm mt-1">
          Last updated {current.assessmentDate}
        </p>
      </div>

      {/* Current State Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-navy-600 rounded-xl border border-cream/10 p-5">
          <span className="text-xs font-semibold text-cream/40 uppercase tracking-wider">Overall Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tabular-nums" style={{ color: overallColor }}>
              {current.overallScore}
            </span>
            <span className="text-sm font-medium" style={{ color: overallColor }}>{riskLevel}</span>
          </div>
        </div>

        {/* Domain Scores */}
        {(['rule-of-law', 'operating-economic', 'societal-institutional'] as const).map((domainId) => {
          const score = current.domainScores[domainId];
          const color = getScoreColor(score);
          const names: Record<string, string> = {
            'rule-of-law': 'Rule of Law',
            'operating-economic': 'Economic',
            'societal-institutional': 'Societal',
          };
          return (
            <div key={domainId} className="bg-navy-600 rounded-xl border border-cream/10 p-5">
              <span className="text-xs font-semibold text-cream/40 uppercase tracking-wider">{names[domainId]}</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black tabular-nums" style={{ color }}>
                  {score.toFixed(1)}
                </span>
                <span className="text-sm font-medium" style={{ color }}>{getRiskLevel(score)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Scores Grid */}
      <div>
        <h2 className="text-sm font-semibold text-cream/60 uppercase tracking-wider mb-3">Category Scores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const catScore = current.scores[cat.id];
            if (!catScore) return null;
            const color = getScoreColor(catScore.score);
            return (
              <div key={cat.id} className="bg-navy-600 rounded-lg border border-cream/10 px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs text-cream/60 truncate mr-2">{cat.name}</span>
                <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color }}>
                  {catScore.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-cream/60 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-navy-600 rounded-xl border border-cream/10 p-5 hover:border-gold/30 hover:shadow-ln-medium transition-all group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: action.color }} />
                <span className="text-sm font-semibold text-cream group-hover:text-gold transition-colors">
                  {action.label}
                </span>
              </div>
              <p className="text-xs text-cream/40">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
