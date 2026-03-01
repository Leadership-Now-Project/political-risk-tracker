'use client';

import { useState, useEffect } from 'react';

interface CategoryScore {
  score: number;
  trend: string;
}

interface CurrentData {
  scores: Record<string, CategoryScore>;
  domainScores: Record<string, number>;
  overallScore: number;
  riskLevel: string;
  assessmentDate: string;
}

export default function SnapshotPage() {
  const [current, setCurrent] = useState<CurrentData | null>(null);
  const [summary, setSummary] = useState('');
  const [keyDevelopments, setKeyDevelopments] = useState(['', '', '']);
  const [categoryChanges, setCategoryChanges] = useState<{ category: string; from: number; to: number; rationale: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/scores?file=current')
      .then((r) => r.json())
      .then((data) => setCurrent(data));
  }, []);

  function addCategoryChange() {
    setCategoryChanges([...categoryChanges, { category: '', from: 0, to: 0, rationale: '' }]);
  }

  function updateCategoryChange(index: number, field: string, value: string | number) {
    setCategoryChanges(categoryChanges.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    ));
  }

  function removeCategoryChange(index: number) {
    setCategoryChanges(categoryChanges.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    if (!current) return;
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          keyDevelopments: keyDevelopments.filter((d) => d.trim()),
          categoryChanges: categoryChanges.filter((c) => c.category && c.rationale),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus({ type: 'success', message: `Snapshot created for ${data.date}. ${data.filesCommitted} files committed to GitHub.` });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to create snapshot' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error' });
    } finally {
      setSaving(false);
    }
  }

  const CATEGORY_IDS = [
    'elections', 'rule-of-law', 'national-security',
    'regulatory-stability', 'trade-policy', 'government-contracts', 'fiscal-policy',
    'media-freedom', 'civil-discourse', 'institutional-integrity',
  ];

  const scoreColor = (s: number) => {
    if (s < 3) return '#22c55e';
    if (s < 5) return '#eab308';
    if (s < 7) return '#f97316';
    if (s < 9) return '#ef4444';
    return '#991b1b';
  };

  if (!current) {
    return <div className="text-cream/40 text-sm">Loading...</div>;
  }

  const now = new Date();
  const snapshotDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-20`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cream">Monthly Snapshot</h1>
        <p className="text-cream/40 text-sm mt-1">
          Create a point-in-time archive for {snapshotDate}
        </p>
      </div>

      {status && (
        <div className={`px-4 py-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
          {status.message}
        </div>
      )}

      {/* Current Scores Preview */}
      <div className="bg-navy-600 rounded-xl border border-cream/10 p-5">
        <h2 className="text-xs font-semibold text-cream/40 uppercase tracking-wider mb-3">Current Scores (will be archived)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORY_IDS.map((catId) => {
            const score = current.scores[catId]?.score ?? 0;
            return (
              <div key={catId} className="flex items-center justify-between bg-navy-500 rounded-lg px-3 py-2">
                <span className="text-xs text-cream/50 truncate mr-2">{catId}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cream/5">
          <span className="text-sm text-cream/50">Overall: <span className="font-bold text-cream">{current.overallScore}</span></span>
          <span className="text-sm text-cream/50">{current.riskLevel}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-navy-600 rounded-xl border border-cream/10 p-5 space-y-4">
        <h2 className="text-xs font-semibold text-cream/40 uppercase tracking-wider">Monthly Summary</h2>

        <div>
          <label className="text-xs text-cream/40 font-medium block mb-1">Summary (1 sentence)</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/20 focus:outline-none focus:border-gold/50 resize-none"
            placeholder="One-sentence summary of the month's key developments"
          />
        </div>

        <div>
          <label className="text-xs text-cream/40 font-medium block mb-1">Key Developments (up to 3)</label>
          <div className="space-y-2">
            {keyDevelopments.map((dev, i) => (
              <input
                key={i}
                value={dev}
                onChange={(e) => {
                  const updated = [...keyDevelopments];
                  updated[i] = e.target.value;
                  setKeyDevelopments(updated);
                }}
                className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/20 focus:outline-none focus:border-gold/50"
                placeholder={`Development ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Category Changes */}
      <div className="bg-navy-600 rounded-xl border border-cream/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-cream/40 uppercase tracking-wider">Category Changes</h2>
          <button onClick={addCategoryChange} className="text-xs text-gold hover:text-gold/80">+ Add Change</button>
        </div>

        {categoryChanges.length === 0 && (
          <p className="text-xs text-cream/30">No category changes this month. Add changes for any category whose score moved.</p>
        )}

        {categoryChanges.map((change, i) => (
          <div key={i} className="flex gap-2 items-start">
            <select
              value={change.category}
              onChange={(e) => updateCategoryChange(i, 'category', e.target.value)}
              className="bg-navy-500 border border-cream/10 rounded-lg px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-gold/50 w-40"
            >
              <option value="">Select...</option>
              {CATEGORY_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
            <input
              type="number"
              min="1"
              max="10"
              value={change.from || ''}
              onChange={(e) => updateCategoryChange(i, 'from', parseInt(e.target.value) || 0)}
              className="bg-navy-500 border border-cream/10 rounded-lg px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-gold/50 w-14 text-center"
              placeholder="From"
            />
            <span className="text-cream/30 text-xs self-center">&rarr;</span>
            <input
              type="number"
              min="1"
              max="10"
              value={change.to || ''}
              onChange={(e) => updateCategoryChange(i, 'to', parseInt(e.target.value) || 0)}
              className="bg-navy-500 border border-cream/10 rounded-lg px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-gold/50 w-14 text-center"
              placeholder="To"
            />
            <input
              value={change.rationale}
              onChange={(e) => updateCategoryChange(i, 'rationale', e.target.value)}
              className="flex-1 bg-navy-500 border border-cream/10 rounded-lg px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-gold/50"
              placeholder="Rationale for change"
            />
            <button onClick={() => removeCategoryChange(i)} className="text-red-400/50 hover:text-red-400 text-xs mt-1">
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={saving || !summary}
        className="w-full py-3 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Creating Snapshot...' : 'Create Monthly Snapshot'}
      </button>
    </div>
  );
}
