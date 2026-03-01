'use client';

import { useState, useEffect } from 'react';

type Tab = 'actions' | 'pushback';

interface Action {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  description: string;
  dateIssued: string;
  agencies: string[];
  pushbackIds: string[];
  relatedRiskCategories: string[];
  sources: string[];
}

interface PushbackEntry {
  id: string;
  title: string;
  type: string;
  caseStatus: string;
  description: string;
  dateFiled: string;
  court?: string;
  plaintiffs: string[];
  actionIds: string[];
  outcome?: string;
  sources: string[];
}

const ACTION_TYPES = ['executive-order', 'presidential-memo', 'agency-rule', 'policy-directive', 'proclamation', 'signing-statement'];
const ACTION_STATUSES = ['implemented', 'partially-implemented', 'blocked', 'reversed', 'pending-litigation', 'under-review'];
const ACTION_CATEGORIES = ['immigration', 'environment', 'civil-rights', 'government-reform', 'economic-policy', 'judiciary', 'healthcare', 'education', 'foreign-policy', 'media-press'];
const PUSHBACK_TYPES = ['federal-lawsuit', 'state-lawsuit', 'congressional-action', 'state-legislation', 'agency-resistance', 'judicial-ruling', 'public-protest'];
const CASE_STATUSES = ['filed', 'preliminary-injunction', 'injunction-granted', 'injunction-denied', 'ruling-against', 'ruling-for', 'appealed', 'settled', 'dismissed'];

export default function ActionsManager() {
  const [tab, setTab] = useState<Tab>('actions');
  const [actions, setActions] = useState<Action[]>([]);
  const [pushback, setPushback] = useState<PushbackEntry[]>([]);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [editingPushback, setEditingPushback] = useState<PushbackEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/actions')
      .then((r) => r.json())
      .then((data) => {
        setActions(data.actions || []);
        setPushback(data.pushback || []);
      });
  }, []);

  async function save(updatedActions: Action[], updatedPushback: PushbackEntry[]) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: updatedActions, pushback: updatedPushback }),
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Actions saved and committed to GitHub.' });
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

  // Action handlers
  function handleNewAction() {
    setEditingAction({
      id: `action-${actions.length + 1}`,
      title: '', type: ACTION_TYPES[0], category: ACTION_CATEGORIES[0],
      status: 'implemented', description: '', dateIssued: new Date().toISOString().split('T')[0],
      agencies: [], pushbackIds: [], relatedRiskCategories: [], sources: [],
    });
    setIsNew(true);
  }

  function handleSaveAction() {
    if (!editingAction) return;
    let updated: Action[];
    if (isNew) {
      updated = [...actions, editingAction];
    } else {
      updated = actions.map((a) => (a.id === editingAction.id ? editingAction : a));
    }
    setActions(updated);
    setEditingAction(null);
    save(updated, pushback);
  }

  function handleDeleteAction(id: string) {
    if (!confirm('Delete this action?')) return;
    const updated = actions.filter((a) => a.id !== id);
    setActions(updated);
    save(updated, pushback);
  }

  // Pushback handlers
  function handleNewPushback() {
    setEditingPushback({
      id: `case-${pushback.length + 1}`,
      title: '', type: PUSHBACK_TYPES[0], caseStatus: 'filed',
      description: '', dateFiled: new Date().toISOString().split('T')[0],
      plaintiffs: [], actionIds: [], sources: [],
    });
    setIsNew(true);
  }

  function handleSavePushback() {
    if (!editingPushback) return;
    let updated: PushbackEntry[];
    if (isNew) {
      updated = [...pushback, editingPushback];
    } else {
      updated = pushback.map((p) => (p.id === editingPushback.id ? editingPushback : p));
    }
    setPushback(updated);
    setEditingPushback(null);
    save(actions, updated);
  }

  function handleDeletePushback(id: string) {
    if (!confirm('Delete this entry?')) return;
    const updated = pushback.filter((p) => p.id !== id);
    setPushback(updated);
    save(actions, updated);
  }

  const statusColors: Record<string, string> = {
    'implemented': 'bg-green-500/15 text-green-400',
    'partially-implemented': 'bg-yellow-500/15 text-yellow-400',
    'blocked': 'bg-red-500/15 text-red-400',
    'reversed': 'bg-red-500/15 text-red-400',
    'pending-litigation': 'bg-orange-500/15 text-orange-400',
    'under-review': 'bg-blue-500/15 text-blue-400',
    'filed': 'bg-blue-500/15 text-blue-400',
    'injunction-granted': 'bg-green-500/15 text-green-400',
    'ruling-for': 'bg-green-500/15 text-green-400',
    'ruling-against': 'bg-red-500/15 text-red-400',
    'appealed': 'bg-orange-500/15 text-orange-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream">Actions & Pushback</h1>
          <p className="text-cream/40 text-sm mt-1">
            {actions.length} actions &middot; {pushback.length} legal challenges
          </p>
        </div>
        <button
          onClick={tab === 'actions' ? handleNewAction : handleNewPushback}
          className="px-4 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 transition-colors text-sm"
        >
          + Add {tab === 'actions' ? 'Action' : 'Pushback'}
        </button>
      </div>

      {saving && (
        <div className="px-4 py-3 rounded-lg text-sm bg-blue-500/15 text-blue-400 border border-blue-500/20">
          Saving to GitHub...
        </div>
      )}

      {status && (
        <div className={`px-4 py-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
          {status.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-500 rounded-lg p-1">
        {(['actions', 'pushback'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t ? 'bg-gold/15 text-gold' : 'text-cream/40 hover:text-cream'
            }`}
          >
            {t === 'actions' ? `Actions (${actions.length})` : `Pushback (${pushback.length})`}
          </button>
        ))}
      </div>

      {/* Actions List */}
      {tab === 'actions' && (
        <div className="space-y-2">
          {actions.map((action) => (
            <div key={action.id} className="bg-navy-600 rounded-xl border border-cream/10 px-5 py-3.5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[action.status] || 'bg-cream/10 text-cream/40'}`}>
                    {action.status}
                  </span>
                  <span className="text-xs text-cream/30">{action.category}</span>
                  <span className="text-xs text-cream/20">{action.dateIssued}</span>
                </div>
                <p className="text-sm text-cream">{action.title}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => { setEditingAction({ ...action }); setIsNew(false); }}
                  className="text-xs text-cream/40 hover:text-gold px-2 py-1 rounded hover:bg-cream/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAction(action.id)}
                  className="text-xs text-cream/40 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pushback List */}
      {tab === 'pushback' && (
        <div className="space-y-2">
          {pushback.map((entry) => (
            <div key={entry.id} className="bg-navy-600 rounded-xl border border-cream/10 px-5 py-3.5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[entry.caseStatus] || 'bg-cream/10 text-cream/40'}`}>
                    {entry.caseStatus}
                  </span>
                  <span className="text-xs text-cream/30">{entry.type}</span>
                  <span className="text-xs text-cream/20">{entry.dateFiled}</span>
                </div>
                <p className="text-sm text-cream">{entry.title}</p>
                {entry.court && <p className="text-xs text-cream/30 mt-0.5">{entry.court}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => { setEditingPushback({ ...entry }); setIsNew(false); }}
                  className="text-xs text-cream/40 hover:text-gold px-2 py-1 rounded hover:bg-cream/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePushback(entry.id)}
                  className="text-xs text-cream/40 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Action Modal */}
      {editingAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-600 rounded-xl border border-cream/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-cream">{isNew ? 'New Action' : 'Edit Action'}</h3>

            <div>
              <label className="text-xs text-cream/40 font-medium block mb-1">Title</label>
              <input
                value={editingAction.title}
                onChange={(e) => setEditingAction({ ...editingAction, title: e.target.value })}
                className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
              />
            </div>

            <div>
              <label className="text-xs text-cream/40 font-medium block mb-1">Description</label>
              <textarea
                value={editingAction.description}
                onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                rows={3}
                className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Type</label>
                <select
                  value={editingAction.type}
                  onChange={(e) => setEditingAction({ ...editingAction, type: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Category</label>
                <select
                  value={editingAction.category}
                  onChange={(e) => setEditingAction({ ...editingAction, category: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  {ACTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Status</label>
                <select
                  value={editingAction.status}
                  onChange={(e) => setEditingAction({ ...editingAction, status: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  {ACTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Date Issued</label>
                <input
                  type="date"
                  value={editingAction.dateIssued}
                  onChange={(e) => setEditingAction({ ...editingAction, dateIssued: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditingAction(null)} className="px-4 py-2 text-sm text-cream/50 hover:text-cream transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveAction} disabled={!editingAction.title} className="px-5 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors text-sm">
                {isNew ? 'Add Action' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pushback Modal */}
      {editingPushback && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-600 rounded-xl border border-cream/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-cream">{isNew ? 'New Pushback' : 'Edit Pushback'}</h3>

            <div>
              <label className="text-xs text-cream/40 font-medium block mb-1">Title</label>
              <input
                value={editingPushback.title}
                onChange={(e) => setEditingPushback({ ...editingPushback, title: e.target.value })}
                className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
              />
            </div>

            <div>
              <label className="text-xs text-cream/40 font-medium block mb-1">Description</label>
              <textarea
                value={editingPushback.description}
                onChange={(e) => setEditingPushback({ ...editingPushback, description: e.target.value })}
                rows={3}
                className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Type</label>
                <select
                  value={editingPushback.type}
                  onChange={(e) => setEditingPushback({ ...editingPushback, type: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  {PUSHBACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Case Status</label>
                <select
                  value={editingPushback.caseStatus}
                  onChange={(e) => setEditingPushback({ ...editingPushback, caseStatus: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                >
                  {CASE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Date Filed</label>
                <input
                  type="date"
                  value={editingPushback.dateFiled}
                  onChange={(e) => setEditingPushback({ ...editingPushback, dateFiled: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="text-xs text-cream/40 font-medium block mb-1">Court</label>
                <input
                  value={editingPushback.court || ''}
                  onChange={(e) => setEditingPushback({ ...editingPushback, court: e.target.value })}
                  className="w-full bg-navy-500 border border-cream/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/50"
                  placeholder="e.g., U.S. District Court for..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditingPushback(null)} className="px-4 py-2 text-sm text-cream/50 hover:text-cream transition-colors">
                Cancel
              </button>
              <button onClick={handleSavePushback} disabled={!editingPushback.title} className="px-5 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors text-sm">
                {isNew ? 'Add Pushback' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
