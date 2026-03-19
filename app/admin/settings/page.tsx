'use client';

import { useState, useEffect } from 'react';

interface PageConfig {
  enabled: boolean;
  label: string;
}

interface SiteConfig {
  pages: Record<string, PageConfig>;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/site-config')
      .then(r => r.json())
      .then(setConfig);
  }, []);

  const togglePage = (pageKey: string) => {
    if (!config) return;
    setConfig({
      ...config,
      pages: {
        ...config.pages,
        [pageKey]: {
          ...config.pages[pageKey],
          enabled: !config.pages[pageKey].enabled,
        },
      },
    });
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Saved. Redeploy will apply changes.');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Failed to save');
    }
    setSaving(false);
  };

  if (!config) {
    return <div className="text-cream/50 animate-pulse p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cream">Site Settings</h1>
        <p className="text-cream/40 text-sm mt-1">
          Control which pages are visible to users
        </p>
      </div>

      {/* Page Visibility */}
      <div className="bg-navy-600 rounded-xl border border-cream/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream/10">
          <h2 className="text-sm font-semibold text-cream/60 uppercase tracking-wider">
            Page Visibility
          </h2>
        </div>
        <div className="divide-y divide-cream/5">
          {Object.entries(config.pages).map(([key, page]) => (
            <div key={key} className="flex items-center justify-between px-6 py-4">
              <div>
                <span className="text-sm font-medium text-cream">{page.label}</span>
                <span className="text-xs text-cream/30 ml-2">/{key}</span>
              </div>
              <button
                onClick={() => togglePage(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  page.enabled ? 'bg-gold' : 'bg-cream/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    page.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-gold text-navy font-semibold rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Deploy'}
        </button>
        {message && (
          <span className={`text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </span>
        )}
      </div>

      <p className="text-xs text-cream/30">
        Note: Toggling a page off hides it from the navigation, removes it from the dashboard,
        and redirects direct URLs to the homepage. Changes take effect after Vercel redeploys.
      </p>
    </div>
  );
}
