'use client';

import { useState, useEffect } from 'react';

interface ScenarioImpact {
  category: string;
  delta: number;
  reason: string;
}

interface Scenario {
  id: string;
  label: string;
  category: string;
  domain: string;
  likelihood: 'low' | 'moderate' | 'high';
  impacts: ScenarioImpact[];
}

const CATEGORY_IDS = [
  'elections', 'rule-of-law', 'national-security',
  'regulatory-stability', 'trade-policy', 'government-contracts', 'fiscal-policy',
  'media-freedom', 'civil-discourse', 'institutional-integrity',
];

const DOMAIN_IDS = ['rule-of-law', 'operating-economic', 'societal-institutional'];

const emptyScenario: Scenario = {
  id: '', label: '', category: CATEGORY_IDS[0], domain: DOMAIN_IDS[0],
  likelihood: 'moderate', impacts: [{ category: CATEGORY_IDS[0], delta: 1, reason: '' }],
};

export default function ScenariosManager() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/scenarios')
      .then((r) => r.json())
      .then((data) => setScenarios(data.events || []));
  }, []);

  function handleEdit(scenario: Scenario) {
    setEditing({ ...scenario, impacts: scenario.impacts.map((i) => ({ ...i })) });
    setIsNew(false);
  }

  function handleNew() {
    setEditing({ ...emptyScenario, impacts: [{ ...emptyScenario.impacts[0] }] });
    setIsNew(true);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this scenario?')) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    saveToGitHub(scenarios.filter((s) => s.id !== id));
  }

  function handleSaveScenario() {
    if (!editing) return;
    let updated: Scenario[];
    if (isNew) {
      updated = [...scenarios, editing];
    } else {
      updated = scenarios.map((s) => (s.id === editing.id ? editing : s));
    }
    setScenarios(updated);
    setEditing(null);
    saveToGitHub(updated);
  }

  async function saveToGitHub(data: Scenario[]) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/scenarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: data }),
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Scenarios saved and committed to GitHub.' });
      } else {
        const d = await res.json();
        setStatus({ type: 'error', message: d.error || 'Failed to save' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error' });
    } finally {
      setSaving(false);
    }
  }

  function updateEditing(field: string, value: unknown) {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  }

  function updateImpact(index: number, field: string, value: unknown) {
    if (!editing) return;
    const impacts = editing.impacts.map((imp, i) =>
      i === index ? { ...imp, [field]: value } : imp
    );
    setEditing({ ...editing, impacts });
  }

  function addImpact() {
    if (!editing) return;
    setEditing({
      ...editing,
      impacts: [...editing.impacts, { category: CATEGORY_IDS[0], delta: 1, reason: '' }],
    });
  }

  function removeImpact(index: number) {
    if (!editing) return;
    setEditing({ ...editing, impacts: editing.impacts.filter((_, i) => i !== index) });
  }

  const likelihoodColors: Record<string, string> = {
    high: 'bg-red-500/15 text-red-400',
    moderate: 'bg-yellow-500/15 text-yellow-400',
    low: 'bg-green-500/15 text-green-400',
  };

  // Stats
  const byLikelihood = scenarios.reduce((acc, s) => {
    acc[s.likelihood] = (acc[s.likelihood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream">Scenarios</h1>
          <p className="text-cream/40 text-sm mt-1">
            {scenarios.length} scenarios &middot; {byLikelihood.high || 0} high &middot; {byLikelihood.moderate || 0} moderate &middot; {byLikelihood.low || 0} low
          </p>
        </div>
        <button onClick={handleNew} className="px-4 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 transition-colors text-sm">
          + Add Scenario
        </button>
      </div>

      {status && (
        <div className={`px-4 py-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
          {status.message}
        </div>
      )}

      {saving && (
        <div className="px-4 py-3 rounded-lg text-sm bg-blue-500/15 text-blue-400 border border-blue-500/20">
          Saving to GitHub...
        </div>
      )}

      {/* Scenario List */}
      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="bg-navy-600 rounded-xl border border-cream/10 px-5 py-3.5 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${likelihoodColors[scenario.likelihood]}`}>
                  {scenario.likelihood}
                </span>
                <span className="text-xs text-cream/30">{scenario.category}</span>
              </div>
              <p className="text-sm text-cream">{scenario.label}</p>
              <div className="flex gap-2 mt-1.5">
                {scenario.impacts.map((imp, i) => (
                  <span key={i} className={`text-xs ${imp.delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {imp.category} {imp.delta > 0 ? '+' : ''}{imp.delta}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => handleEdit(scenario)} className="text-xs text-cream/40 hover:text-gold px-2 py-1 rounded hover:bg-cream/5">
                Edit
              </button>
              <button onClick={() => handleDelete(scenario.id)} className="text-xs text-cream/40 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-600 rounded-xl border border-cream/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-cream">{isNew ? 'New Scenario' : 'Edit Scenario'}</h3>

            {/* ID */}
            <div>
              <label className="text-xs text-cream/40 font-medium block mb-1">ID (kebab-case)</label>
              <input
                value={editing.id}
                onChange={(e) => updateEditing('id', e.target.value)}
                className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                placeholder="my-scenario-id"
              />
            </div>

            {/* Label */}
            <div>
              <label className="text-xs text-cream/40 font-medium block mb-1">Label</label>
              <textarea
                value={editing.label}
                onChange={(e) => updateEditing('label', e.target.value)}
                rows={2}
                className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50 resize-none"
                placeholder="Specific, concrete description of the event"
              />
            </div>

            {/* Category + Domain + Likelihood */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Category</label>
                <select
                  value={editing.category}
                  onChange={(e) => updateEditing('category', e.target.value)}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  {CATEGORY_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Domain</label>
                <select
                  value={editing.domain}
                  onChange={(e) => updateEditing('domain', e.target.value)}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  {DOMAIN_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Likelihood</label>
                <select
                  value={editing.likelihood}
                  onChange={(e) => updateEditing('likelihood', e.target.value)}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Impacts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-cream/40 font-medium">Impacts</label>
                <button onClick={addImpact} className="text-xs text-gold hover:text-gold/80">+ Add Impact</button>
              </div>
              <div className="space-y-2">
                {editing.impacts.map((impact, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <select
                      value={impact.category}
                      onChange={(e) => updateImpact(i, 'category', e.target.value)}
                      className="bg-navy-500 border border-cream/10 rounded-lg px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-gold/50 w-36"
                    >
                      {CATEGORY_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
                    </select>
                    <select
                      value={impact.delta}
                      onChange={(e) => updateImpact(i, 'delta', parseInt(e.target.value))}
                      className="bg-navy-500 border border-cream/10 rounded-lg px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-gold/50 w-16"
                    >
                      {[-2, -1, 1, 2].map((d) => (
                        <option key={d} value={d}>{d > 0 ? `+${d}` : d}</option>
                      ))}
                    </select>
                    <input
                      value={impact.reason}
                      onChange={(e) => updateImpact(i, 'reason', e.target.value)}
                      className="flex-1 bg-navy-500 border border-cream/10 rounded-lg px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-gold/50"
                      placeholder="Reason for impact"
                    />
                    <button onClick={() => removeImpact(i)} className="text-red-400/50 hover:text-red-400 text-xs mt-1">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-cream/50 hover:text-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScenario}
                disabled={!editing.id || !editing.label}
                className="px-5 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors text-sm"
              >
                {isNew ? 'Add Scenario' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
