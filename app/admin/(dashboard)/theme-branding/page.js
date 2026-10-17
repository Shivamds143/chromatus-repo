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
  { key: 'colorBrandorangeDark', label: 'Brand orange — dark' },
  { key: 'colorEyebrow', label: 'Eyebrow tags (light backgrounds)' },
  { key: 'colorEyebrowDark', label: 'Eyebrow tags (hero & dark banners)' }
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

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-navy uppercase tracking-wide">
                🏷️ Eyebrows &amp; Section Kickers Color
              </p>
              <p className="text-xs text-inkgray mt-0.5">
                Customize the color of the small category tags and kicker labels that appear above headings across all sections and pages.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            {/* Light BG Section Eyebrow */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy">Section Eyebrows (Light BG)</span>
                <span className="text-[10px] text-inkgray font-mono">e.g. Services, About, Insights</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.colorEyebrow || '#1F82C5'}
                  onChange={(e) => update('colorEyebrow', e.target.value)}
                  className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                />
                <input
                  className="w-28 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  value={settings.colorEyebrow || '#1F82C5'}
                  onChange={(e) => update('colorEyebrow', e.target.value)}
                />
              </div>
              {/* Live Preview Box */}
              <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs">
                <p
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: settings.colorEyebrow || '#1F82C5' }}
                >
                  WHAT WE DO
                </p>
                <p className="text-xs font-bold text-navy mt-1">Research &amp; Consulting Excellence</p>
              </div>
            </div>

            {/* Dark BG / Hero Eyebrow */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy">Hero &amp; Dark Banner Eyebrows</span>
                <span className="text-[10px] text-inkgray font-mono">e.g. Hero headers, Testimonials</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.colorEyebrowDark || '#EA9322'}
                  onChange={(e) => update('colorEyebrowDark', e.target.value)}
                  className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                />
                <input
                  className="w-28 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  value={settings.colorEyebrowDark || '#EA9322'}
                  onChange={(e) => update('colorEyebrowDark', e.target.value)}
                />
              </div>
              {/* Live Preview Box */}
              <div className="p-3 bg-[#0B2E42] rounded-lg border border-line-dark shadow-2xs">
                <p
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: settings.colorEyebrowDark || '#EA9322' }}
                >
                  INDEPENDENT THINKING
                </p>
                <p className="text-xs font-bold text-white mt-1">Make your next move meaningful.</p>
              </div>
            </div>
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
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Contact Information &amp; Office</p>
        <p className="text-xs text-inkgray">
          Shown on the footer, contact section, and across public inquiries.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-inkgray mb-1">Phone Number</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="+91 74984 65144"
              value={globalElements.contactPhone || ''}
              onChange={(e) => updateGE('contactPhone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-inkgray mb-1">Email Address</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="info@chromatus.com"
              value={globalElements.contactEmail || ''}
              onChange={(e) => updateGE('contactEmail', e.target.value)}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-inkgray mb-1">Office Address</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Sai Shilp, Near Universal, Warje, Pune 411052"
              value={globalElements.contactAddress || ''}
              onChange={(e) => updateGE('contactAddress', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-inkgray mb-1">Business Hours</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Monday – Friday, 9AM – 8PM IST"
              value={globalElements.contactHours || ''}
              onChange={(e) => updateGE('contactHours', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-6 mt-6">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Footer &amp; Social Links</p>
        <div>
          <label className="block text-xs text-inkgray mb-1">Footer tagline</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={globalElements.footerTagline || ''}
            onChange={(e) => updateGE('footerTagline', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-inkgray mb-1">Footer description / note</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={2}
            value={globalElements.footerNote || ''}
            onChange={(e) => updateGE('footerNote', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-inkgray mb-1">Copyright line</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Chromatus Consulting. All rights reserved."
            value={globalElements.footerCopyright || ''}
            onChange={(e) => updateGE('footerCopyright', e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-inkgray">Social links (LinkedIn, Twitter / X, Facebook, etc.)</p>
            <button onClick={addSocialLink} className="text-xs font-semibold text-brandblue">
              + Add link
            </button>
          </div>
          <div className="space-y-2">
            {(globalElements.socialLinks || []).map((link, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                <input
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Platform / Label (e.g. LinkedIn)"
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
