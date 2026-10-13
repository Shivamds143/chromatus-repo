'use client';

import { useEffect, useState } from 'react';
import MediaPickerButton from '@/components/admin/MediaPickerButton';

const COLOR_FIELDS = [
  { key: 'colorNavy', label: 'Navy (primary)' },
  { key: 'colorNavyLight', label: 'Navy — light' },
  { key: 'colorNavyDark', label: 'Navy — dark' },
  { key: 'colorBrandblue', label: 'Brand blue' },
  { key: 'colorBrandblueDark', label: 'Brand blue — dark' },
  { key: 'colorBrandorange', label: 'Brand orange (accent)' },
  { key: 'colorBrandorangeDark', label: 'Brand orange — dark' }
];

export default function ThemeBrandingPage() {
  const [settings, setSettings] = useState(null);
  const [globalElements, setGlobalElements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then((res) => res.json()),
      fetch('/api/admin/global-elements').then((res) => res.json())
    ])
      .then(([settingsJson, elementsJson]) => {
        setSettings(settingsJson.settings);
        setGlobalElements(elementsJson.elements);
      })
      .finally(() => setLoading(false));
  }, []);

  function update(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function updateGE(key, value) {
    setGlobalElements((g) => ({ ...g, [key]: value }));
  }

  function updateSocialLink(index, field, value) {
    setGlobalElements((g) => {
      const links = [...(g.socialLinks || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...g, socialLinks: links };
    });
  }

  function addSocialLink() {
    setGlobalElements((g) => ({
      ...g,
      socialLinks: [...(g.socialLinks || []), { label: '', href: '', icon: 'linkedin' }]
    }));
  }

  function removeSocialLink(index) {
    setGlobalElements((g) => ({
      ...g,
      socialLinks: (g.socialLinks || []).filter((_, i) => i !== index)
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const [settingsRes, geRes] = await Promise.all([
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        }),
        fetch('/api/admin/global-elements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(globalElements)
        })
      ]);
      const settingsJson = await settingsRes.json();
      const geJson = await geRes.json();
      if (!settingsRes.ok || !geRes.ok) {
        setMessage(settingsJson.error || geJson.error || 'Save failed.');
        return;
      }
      setMessage('Saved — changes are live across the site immediately.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings || !globalElements) {
    return <p className="text-sm text-inkgray">Loading…</p>;
  }

  return (
    <div className="max-w-2xl pb-24">
      <h1 className="text-2xl font-bold text-navy mb-1">Theme &amp; Branding</h1>
      <p className="text-sm text-inkgray mb-6">
        Logo, brand colors, fonts, header &amp; footer content, and calls-to-action used across the
        whole website.
      </p>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-6">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Identity</p>
        <div>
          <label className="block text-xs font-semibold text-inkgray uppercase tracking-wide mb-1">
            Site name
          </label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={settings.siteName}
            onChange={(e) => update('siteName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-inkgray uppercase tracking-wide mb-1">
            Tagline
          </label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={settings.tagline}
            onChange={(e) => update('tagline', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-inkgray uppercase tracking-wide mb-1">
            Logo
          </label>
          <div className="flex items-center gap-3">
            {settings.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto rounded bg-bglight p-1" />
            )}
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={settings.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              placeholder="/images/logo.png"
            />
            <MediaPickerButton onSelect={(url) => update('logoUrl', url)} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-inkgray uppercase tracking-wide mb-3">Brand colors</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {COLOR_FIELDS.map((f) => (
              <div key={f.key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="h-9 w-9 rounded border border-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm text-navy font-medium">{f.label}</p>
                  <input
                    className="w-28 border border-gray-200 rounded px-2 py-1 text-xs font-mono"
                    value={settings[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-inkgray uppercase tracking-wide mb-3">Fonts</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-inkgray mb-1">Heading font (CSS font-family)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="inherit"
                value={globalElements.fontHeading}
                onChange={(e) => updateGE('fontHeading', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-inkgray mb-1">Body font (CSS font-family)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="inherit"
                value={globalElements.fontBody}
                onChange={(e) => updateGE('fontBody', e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-inkgray mt-2">
            Use a font already loaded on the site, e.g. <code className="bg-gray-100 px-1 rounded">Georgia, serif</code>. Leave as
            &ldquo;inherit&rdquo; to keep the current default.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-6 mt-6">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Header call-to-action</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-inkgray mb-1">Button label</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={globalElements.headerCtaLabel}
              onChange={(e) => updateGE('headerCtaLabel', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-inkgray mb-1">Button link</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={globalElements.headerCtaHref}
              onChange={(e) => updateGE('headerCtaHref', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-6 mt-6">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">
          Call-to-action band (shown near the bottom of pages)
        </p>
        <div>
          <label className="block text-xs text-inkgray mb-1">Heading</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={2}
            value={globalElements.ctaBandHeading}
            onChange={(e) => updateGE('ctaBandHeading', e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-inkgray mb-1">Primary button label</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={globalElements.ctaBandPrimaryLabel}
              onChange={(e) => updateGE('ctaBandPrimaryLabel', e.target.value)}
            />
            <label className="block text-xs text-inkgray mb-1 mt-2">Primary button link</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={globalElements.ctaBandPrimaryHref}
              onChange={(e) => updateGE('ctaBandPrimaryHref', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-inkgray mb-1">Secondary button label</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={globalElements.ctaBandSecondaryLabel}
              onChange={(e) => updateGE('ctaBandSecondaryLabel', e.target.value)}
            />
            <label className="block text-xs text-inkgray mb-1 mt-2">Secondary button link</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={globalElements.ctaBandSecondaryHref}
              onChange={(e) => updateGE('ctaBandSecondaryHref', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-6 mt-6">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Footer</p>
        <div>
          <label className="block text-xs text-inkgray mb-1">Footer tagline</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={globalElements.footerTagline}
            onChange={(e) => updateGE('footerTagline', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-inkgray mb-1">Footer note (optional, small print under the tagline)</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={globalElements.footerNote}
            onChange={(e) => updateGE('footerNote', e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-inkgray">Social links</p>
            <button onClick={addSocialLink} className="text-xs font-semibold text-brandblue">
              + Add link
            </button>
          </div>
          <div className="space-y-2">
            {(globalElements.socialLinks || []).map((link, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                <input
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateSocialLink(i, 'label', e.target.value)}
                />
                <input
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  placeholder="https://…"
                  value={link.href}
                  onChange={(e) => updateSocialLink(i, 'href', e.target.value)}
                />
                <button onClick={() => removeSocialLink(i)} className="text-xs font-semibold text-red-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
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
