'use client';

import { useState, useEffect } from 'react';

interface CategoryScore {
  score: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  keyFindings: string[];
  sources: string[];
  lastUpdated: string;
}

interface Category {
  id: string;
  name: string;
  domain: string;
}

export default function ScoresEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [scores, setScores] = useState<Record<string, CategoryScore>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [catRes, currentRes] = await Promise.all([
        fetch('/api/admin/scores?file=categories'),
        fetch('/api/admin/scores?file=current'),
      ]);
      const catData = await catRes.json();
      const currentData = await currentRes.json();
      setCategories(catData.categories || []);
      setScores(currentData.scores || {});
    }
    load();
  }, []);

  function updateScore(catId: string, field: string, value: unknown) {
    setScores((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], [field]: value },
    }));
  }

  function updateFinding(catId: string, index: number, value: string) {
    setScores((prev) => {
      const findings = [...(prev[catId]?.keyFindings || [])];
      findings[index] = value;
      return { ...prev, [catId]: { ...prev[catId], keyFindings: findings } };
    });
  }

  function addFinding(catId: string) {
    setScores((prev) => {
      const findings = [...(prev[catId]?.keyFindings || []), ''];
      return { ...prev, [catId]: { ...prev[catId], keyFindings: findings } };
    });
  }

  function removeFinding(catId: string, index: number) {
    setScores((prev) => {
      const findings = (prev[catId]?.keyFindings || []).filter((_, i) => i !== index);
      return { ...prev, [catId]: { ...prev[catId], keyFindings: findings } };
    });
  }

  function updateSource(catId: string, index: number, value: string) {
    setScores((prev) => {
      const sources = [...(prev[catId]?.sources || [])];
      sources[index] = value;
      return { ...prev, [catId]: { ...prev[catId], sources } };
    });
  }

  function addSource(catId: string) {
    setScores((prev) => {
      const sources = [...(prev[catId]?.sources || []), ''];
      return { ...prev, [catId]: { ...prev[catId], sources } };
    });
  }

  function removeSource(catId: string, index: number) {
    setScores((prev) => {
      const sources = (prev[catId]?.sources || []).filter((_, i) => i !== index);
      return { ...prev, [catId]: { ...prev[catId], sources } };
    });
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores }),
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Scores saved and committed to GitHub. Vercel will redeploy shortly.' });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to save' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error' });
    } finally {
      setSaving(false);
    }
  }

  const scoreColor = (s: number) => {
    if (s < 3) return '#22c55e';
    if (s < 5) return '#eab308';
    if (s < 7) return '#f97316';
    if (s < 9) return '#ef4444';
    return '#991b1b';
  };

  const domains: Record<string, string> = {
    'rule-of-law': 'Rule of Law & National Security',
    'operating-economic': 'Operating & Economic Environment',
    'societal-institutional': 'Societal & Institutional Integrity',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream">Scores Editor</h1>
          <p className="text-cream/40 text-sm mt-1">Edit category scores, trends, findings, and sources</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {status && (
        <div className={`px-4 py-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
          {status.message}
        </div>
      )}

      {Object.entries(domains).map(([domainId, domainName]) => {
        const domainCats = categories.filter((c) => c.domain === domainId);
        if (domainCats.length === 0) return null;

        return (
          <div key={domainId} className="space-y-2">
            <h2 className="text-xs font-semibold text-cream/40 uppercase tracking-wider">{domainName}</h2>

            {domainCats.map((cat) => {
              const catScore = scores[cat.id];
              if (!catScore) return null;
              const isExpanded = expanded === cat.id;

              return (
                <div key={cat.id} className="bg-navy-600 rounded-xl border border-cream/10 overflow-hidden">
                  {/* Collapsed row */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : cat.id)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-cream/[0.03] transition-colors"
                  >
                    <span className="text-sm font-medium text-cream flex-1 text-left">{cat.name}</span>

                    {/* Score */}
                    <div
                      className="w-9 h-7 rounded-md flex items-center justify-center text-sm font-bold text-white tabular-nums"
                      style={{ backgroundColor: scoreColor(catScore.score) }}
                    >
                      {catScore.score}
                    </div>

                    {/* Trend */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      catScore.trend === 'increasing' ? 'bg-red-500/15 text-red-400' :
                      catScore.trend === 'decreasing' ? 'bg-green-500/15 text-green-400' :
                      'bg-cream/10 text-cream/40'
                    }`}>
                      {catScore.trend}
                    </span>

                    {/* Expand icon */}
                    <svg className={`w-4 h-4 text-cream/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded editor */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-cream/5 space-y-4">
                      {/* Score + Trend row */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-cream/40 font-medium">Score</label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={catScore.score}
                            onChange={(e) => updateScore(cat.id, 'score', parseInt(e.target.value))}
                            className="w-32 accent-gold"
                          />
                          <span className="text-lg font-black tabular-nums w-6 text-center" style={{ color: scoreColor(catScore.score) }}>
                            {catScore.score}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-cream/40 font-medium">Trend</label>
                          <select
                            value={catScore.trend}
                            onChange={(e) => updateScore(cat.id, 'trend', e.target.value)}
                            className="bg-navy-500 border border-cream/10 rounded-lg px-3 py-1.5 text-sm text-cream focus:outline-none focus:border-gold/50"
                          >
                            <option value="increasing">Increasing</option>
                            <option value="stable">Stable</option>
                            <option value="decreasing">Decreasing</option>
                          </select>
                        </div>
                      </div>

                      {/* Key Findings */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-cream/40 font-medium">Key Findings</label>
                          <button onClick={() => addFinding(cat.id)} className="text-xs text-gold hover:text-gold/80">+ Add</button>
                        </div>
                        <div className="space-y-2">
                          {(catScore.keyFindings || []).map((finding, i) => (
                            <div key={i} className="flex gap-2">
                              <textarea
                                value={finding}
                                onChange={(e) => updateFinding(cat.id, i, e.target.value)}
                                rows={2}
                                className="flex-1 bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/20 focus:outline-none focus:border-gold/50 resize-none"
                              />
                              <button onClick={() => removeFinding(cat.id, i)} className="text-red-400/50 hover:text-red-400 text-xs self-start mt-2">
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sources */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-cream/40 font-medium">Sources</label>
                          <button onClick={() => addSource(cat.id)} className="text-xs text-gold hover:text-gold/80">+ Add</button>
                        </div>
                        <div className="space-y-1.5">
                          {(catScore.sources || []).map((source, i) => (
                            <div key={i} className="flex gap-2">
                              <input
                                value={source}
                                onChange={(e) => updateSource(cat.id, i, e.target.value)}
                                className="flex-1 bg-navy-500 border border-cream/10 rounded-lg px-3 py-1.5 text-sm text-cream placeholder-cream/20 focus:outline-none focus:border-gold/50"
                                placeholder="https://..."
                              />
                              <button onClick={() => removeSource(cat.id, i)} className="text-red-400/50 hover:text-red-400 text-xs">
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
