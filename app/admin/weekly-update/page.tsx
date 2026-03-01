'use client';

import { useState, useEffect } from 'react';

interface CategoryScore {
  score: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  keyFindings: string[];
  sources: string[];
  lastUpdated: string;
}

interface ProposedUpdate {
  categoryId: string;
  currentScore: number;
  proposedScore: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  keyFindings: string[];
  sources: string[];
  justification: string;
}

export default function WeeklyUpdatePage() {
  const [currentScores, setCurrentScores] = useState<Record<string, CategoryScore>>({});
  const [proposals, setProposals] = useState<ProposedUpdate[]>([]);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [researching, setResearching] = useState(false);
  const [applying, setApplying] = useState(false);
  const [researchStatus, setResearchStatus] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/scores?file=current')
      .then((r) => r.json())
      .then((data) => setCurrentScores(data.scores || {}));
  }, []);

  async function runResearch() {
    setResearching(true);
    setProposals([]);
    setAccepted({});
    setStatus(null);
    setResearchStatus('Running AI research across all categories. This may take 30-60 seconds...');

    try {
      const res = await fetch('/api/admin/weekly-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'research' }),
      });

      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
        // Default: accept all
        const acc: Record<string, boolean> = {};
        (data.proposals || []).forEach((p: ProposedUpdate) => { acc[p.categoryId] = true; });
        setAccepted(acc);
        setResearchStatus('');
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Research failed' });
        setResearchStatus('');
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error during research' });
      setResearchStatus('');
    } finally {
      setResearching(false);
    }
  }

  function updateProposal(catId: string, field: string, value: unknown) {
    setProposals((prev) =>
      prev.map((p) => (p.categoryId === catId ? { ...p, [field]: value } : p))
    );
  }

  async function applyChanges() {
    setApplying(true);
    setStatus(null);

    const acceptedProposals = proposals.filter((p) => accepted[p.categoryId]);
    const updatedScores = { ...currentScores };

    acceptedProposals.forEach((p) => {
      updatedScores[p.categoryId] = {
        score: p.proposedScore,
        trend: p.trend,
        keyFindings: p.keyFindings,
        sources: p.sources,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    });

    try {
      const res = await fetch('/api/admin/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: updatedScores }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: `Applied ${acceptedProposals.length} category updates. Committed to GitHub.` });
        setCurrentScores(updatedScores);
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to apply' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error' });
    } finally {
      setApplying(false);
    }
  }

  const scoreColor = (s: number) => {
    if (s < 3) return '#22c55e';
    if (s < 5) return '#eab308';
    if (s < 7) return '#f97316';
    if (s < 9) return '#ef4444';
    return '#991b1b';
  };

  const acceptedCount = Object.values(accepted).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream">AI Weekly Update</h1>
          <p className="text-cream/40 text-sm mt-1">
            Run AI-assisted research to propose score updates
          </p>
        </div>
        {proposals.length === 0 ? (
          <button
            onClick={runResearch}
            disabled={researching}
            className="px-5 py-2.5 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
          >
            {researching ? 'Researching...' : 'Run Research'}
          </button>
        ) : (
          <button
            onClick={applyChanges}
            disabled={applying || acceptedCount === 0}
            className="px-5 py-2.5 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
          >
            {applying ? 'Applying...' : `Apply ${acceptedCount} Changes`}
          </button>
        )}
      </div>

      {researchStatus && (
        <div className="px-4 py-3 rounded-lg text-sm bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          {researchStatus}
        </div>
      )}

      {status && (
        <div className={`px-4 py-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
          {status.message}
        </div>
      )}

      {/* Proposals */}
      {proposals.length > 0 && (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const isAccepted = accepted[proposal.categoryId];
            const delta = proposal.proposedScore - proposal.currentScore;

            return (
              <div
                key={proposal.categoryId}
                className={`bg-navy-600 rounded-xl border transition-colors ${
                  isAccepted ? 'border-gold/30' : 'border-cream/10 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-4 px-5 py-3.5">
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAccepted}
                      onChange={(e) => setAccepted({ ...accepted, [proposal.categoryId]: e.target.checked })}
                      className="w-4 h-4 rounded border-cream/20 accent-gold"
                    />
                    <span className="text-sm font-medium text-cream">{proposal.categoryId}</span>
                  </label>

                  {/* Score comparison */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(proposal.currentScore) }}>
                      {proposal.currentScore}
                    </span>
                    <span className="text-cream/30">&rarr;</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={proposal.proposedScore}
                        onChange={(e) => updateProposal(proposal.categoryId, 'proposedScore', parseInt(e.target.value) || 1)}
                        className="w-12 bg-navy-500 border border-cream/10 rounded px-2 py-1 text-sm font-bold tabular-nums text-center focus:outline-none focus:border-gold/50"
                        style={{ color: scoreColor(proposal.proposedScore) }}
                      />
                    </div>
                    {delta !== 0 && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        delta > 0 ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'
                      }`}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    )}
                  </div>

                  {/* Trend */}
                  <select
                    value={proposal.trend}
                    onChange={(e) => updateProposal(proposal.categoryId, 'trend', e.target.value)}
                    className="bg-navy-500 border border-cream/10 rounded px-2 py-1 text-xs text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="increasing">Increasing</option>
                    <option value="stable">Stable</option>
                    <option value="decreasing">Decreasing</option>
                  </select>
                </div>

                {/* Details (expanded when accepted) */}
                {isAccepted && (
                  <div className="px-5 pb-4 pt-1 border-t border-cream/5 space-y-3">
                    <div>
                      <span className="text-xs text-cream/40 font-medium">Justification</span>
                      <p className="text-xs text-cream/60 mt-0.5">{proposal.justification}</p>
                    </div>
                    <div>
                      <span className="text-xs text-cream/40 font-medium">Key Findings</span>
                      <div className="space-y-1 mt-1">
                        {proposal.keyFindings.map((f, i) => (
                          <textarea
                            key={i}
                            value={f}
                            onChange={(e) => {
                              const findings = [...proposal.keyFindings];
                              findings[i] = e.target.value;
                              updateProposal(proposal.categoryId, 'keyFindings', findings);
                            }}
                            rows={2}
                            className="w-full bg-navy-500 border border-cream/10 rounded px-2 py-1 text-xs text-cream focus:outline-none focus:border-gold/50 resize-none"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {proposals.length === 0 && !researching && (
        <div className="bg-navy-600 rounded-xl border border-cream/10 p-12 text-center">
          <p className="text-cream/40 text-sm">
            Click &ldquo;Run Research&rdquo; to have AI analyze current political developments and propose score updates for all 10 categories.
          </p>
        </div>
      )}
    </div>
  );
}
