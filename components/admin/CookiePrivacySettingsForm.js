'use client';

import { useEffect, useState } from 'react';

const SCRIPT_PLACEHOLDERS = {
  analytics: '<script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>...gtag config...</script>',
  functional: '<script>\n  // e.g. a live-chat or preference-remembering widget\n</script>',
  marketing: '<script>\n  // e.g. Meta Pixel, LinkedIn Insight Tag, ad-retargeting snippets\n</script>'
};

export default function CookiePrivacySettingsForm() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/cookie-settings')
      .then((res) => res.json())
      .then((json) => setSettings(json.settings))
      .finally(() => setLoading(false));
  }, []);

  function update(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function updateCategory(key, field, value) {
    setSettings((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.key === key ? { ...c, [field]: value } : c))
    }));
  }

  function updateScript(key, value) {
    setSettings((s) => ({ ...s, scripts: { ...s.scripts, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/cookie-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || 'Save failed.');
        return;
      }
      setMessage('Saved — the banner updates for visitors immediately.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) return <p className="text-sm text-inkgray">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-inkgray mb-8">
        Controls the bottom cookie banner and the “Cookie Settings” preference center shown across
        the site. Saving here takes effect immediately for visitors — there is no separate publish
        step.
      </p>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-navy">Show cookie banner</p>
            <p className="text-xs text-inkgray mt-0.5">
              When off, the banner and preference center are hidden and only strictly necessary
              cookies run.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 shrink-0">
            <input
              type="checkbox"
              checked={!!settings.bannerEnabled}
              onChange={(e) => update('bannerEnabled', e.target.checked)}
            />
            <span className="text-sm text-navy">{settings.bannerEnabled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-inkgray uppercase tracking-wide mb-1">
            Banner title
          </label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={settings.bannerTitle}
            onChange={(e) => update('bannerTitle', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-inkgray uppercase tracking-wide mb-1">
            Banner message
          </label>
          <textarea
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={settings.bannerMessage}
            onChange={(e) => update('bannerMessage', e.target.value)}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-inkgray uppercase tracking-wide mb-3">
            Button &amp; link labels
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['settingsLabel', 'Cookie Settings button'],
              ['rejectAllLabel', 'Reject All button'],
              ['acceptAllLabel', 'Accept All button'],
              ['savePreferencesLabel', 'Save Preferences button (modal)'],
              ['policyLinkLabel', 'Policy link text'],
              ['policyLinkUrl', 'Policy link URL']
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-inkgray mb-1">{label}</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={settings[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">
          Categories &amp; tracking scripts
        </p>
        {settings.categories.map((cat) => (
          <div key={cat.key} className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs text-inkgray mb-1">Category name</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-navy"
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.key, 'name', e.target.value)}
                />
              </div>
              {cat.required ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-brandblue shrink-0 mt-5">
                  Always active
                </span>
              ) : (
                <label className="inline-flex items-center gap-2 shrink-0 mt-5">
                  <input
                    type="checkbox"
                    checked={cat.enabled !== false}
                    onChange={(e) => updateCategory(cat.key, 'enabled', e.target.checked)}
                  />
                  <span className="text-sm text-navy">Offer this category</span>
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs text-inkgray mb-1">Description shown to visitors</label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={cat.description}
                onChange={(e) => updateCategory(cat.key, 'description', e.target.value)}
              />
            </div>

            {cat.key !== 'necessary' && (
              <div>
                <label className="block text-xs text-inkgray mb-1">
                  Tracking script(s) — only loaded once a visitor grants {cat.name.toLowerCase()} consent
                </label>
                <textarea
                  rows={3}
                  spellCheck={false}
                  placeholder={SCRIPT_PLACEHOLDERS[cat.key]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono"
                  value={settings.scripts[cat.key] || ''}
                  onChange={(e) => updateScript(cat.key, e.target.value)}
                />
                <p className="text-xs text-inkgray mt-1">
                  Paste the full <code>&lt;script&gt;</code> tag(s) from your analytics/ads provider.
                  Left blank, no {cat.name.toLowerCase()} script loads even if a visitor consents.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 mt-6 bg-bglight/95 backdrop-blur py-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-brandorange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {message && <p className="text-sm text-inkgray">{message}</p>}
      </div>
    </div>
  );
}
