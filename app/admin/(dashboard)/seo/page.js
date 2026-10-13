'use client';

import { useEffect, useMemo, useState } from 'react';
import { CMS_PAGES } from '@/lib/cmsRegistry';
import { scoreSeoEntry, scoreLabel } from '@/lib/seoScore';

const TABS = ['General', 'Open Graph', 'Twitter', 'Schema & Advanced'];

const EMPTY_FORM = {
  pagePath: '',
  pageLabel: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  canonicalUrl: '',
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  ogUrl: '',
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  author: '',
  publishedTime: '',
  modifiedTime: '',
  focusKeyword: '',
  schemaJson: ''
};

const DEFAULTS_EMPTY = {
  siteUrl: '',
  defaultMetaTitle: '',
  defaultMetaDescription: '',
  defaultOgImage: '',
  twitterHandle: '',
  organizationName: '',
  organizationLogo: '',
  organizationDescription: ''
};

function toDateInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function AdminSeoPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [customPath, setCustomPath] = useState('');
  const [search, setSearch] = useState('');

  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [defaults, setDefaults] = useState(DEFAULTS_EMPTY);
  const [defaultsLoading, setDefaultsLoading] = useState(true);
  const [defaultsSaving, setDefaultsSaving] = useState(false);
  const [defaultsMessage, setDefaultsMessage] = useState('');

  function load() {
    setLoading(true);
    fetch('/api/admin/seo')
      .then((res) => res.json())
      .then((json) => setEntries(json.entries || []))
      .finally(() => setLoading(false));
  }

  function loadDefaults() {
    setDefaultsLoading(true);
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((json) => {
        const s = json.settings || {};
        setDefaults({
          siteUrl: s.siteUrl || '',
          defaultMetaTitle: s.defaultMetaTitle || '',
          defaultMetaDescription: s.defaultMetaDescription || '',
          defaultOgImage: s.defaultOgImage || '',
          twitterHandle: s.twitterHandle || '',
          organizationName: s.organizationName || '',
          organizationLogo: s.organizationLogo || '',
          organizationDescription: s.organizationDescription || ''
        });
      })
      .finally(() => setDefaultsLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(loadDefaults, []);

  const entriesByPath = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => map.set(e.page_path, e));
    return map;
  }, [entries]);

  // Merge every known site route with whatever SEO overrides already exist,
  // plus any saved override for a route not in the static registry (e.g. a
  // dynamic /services/<slug>, /industries/<slug>, /pages/<slug> or
  // /insights/article/<slug> page created entirely from the admin panel).
  const rows = useMemo(() => {
    const known = CMS_PAGES.map((p) => ({
      path: p.route,
      label: `${p.group} — ${p.label}`,
      saved: entriesByPath.get(p.route) || null
    }));
    const extra = entries
      .filter((e) => !CMS_PAGES.some((p) => p.route === e.page_path))
      .map((e) => ({ path: e.page_path, label: e.page_label || e.page_path, saved: e }));
    return [...known, ...extra].sort((a, b) => a.label.localeCompare(b.label));
  }, [entries, entriesByPath]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q));
  }, [rows, search]);

  // Duplicate-metadata detection: flags any *other* page currently sharing
  // the exact same resolved title or description, so admins can catch
  // copy/paste duplicates before they hurt search rankings.
  const duplicateWarnings = useMemo(() => {
    if (!editing) return [];
    const warnings = [];
    const myTitle = (editing.metaTitle || '').trim().toLowerCase();
    const myDesc = (editing.metaDescription || '').trim().toLowerCase();
    if (myTitle) {
      const clash = entries.find(
        (e) => e.page_path !== editing.pagePath && (e.meta_title || '').trim().toLowerCase() === myTitle
      );
      if (clash) warnings.push(`Meta title is identical to ${clash.page_path}.`);
    }
    if (myDesc) {
      const clash = entries.find(
        (e) => e.page_path !== editing.pagePath && (e.meta_description || '').trim().toLowerCase() === myDesc
      );
      if (clash) warnings.push(`Meta description is identical to ${clash.page_path}.`);
    }
    return warnings;
  }, [editing, entries]);

  const seoScore = useMemo(() => {
    if (!editing) return null;
    return scoreSeoEntry(editing);
  }, [editing]);

  function openEditor(row) {
    setMessage('');
    setIsError(false);
    setActiveTab('General');
    const saved = row.saved;
    setEditing({
      pagePath: row.path,
      pageLabel: row.label,
      metaTitle: saved?.meta_title || '',
      metaDescription: saved?.meta_description || '',
      metaKeywords: saved?.meta_keywords || '',
      canonicalUrl: saved?.canonical_url || '',
      robotsIndex: saved ? saved.robots_index !== false : true,
      robotsFollow: saved ? saved.robots_follow !== false : true,
      ogTitle: saved?.og_title || '',
      ogDescription: saved?.og_description || '',
      ogImage: saved?.og_image || '',
      ogType: saved?.og_type || 'website',
      ogUrl: saved?.og_url || '',
      twitterCard: saved?.twitter_card || 'summary_large_image',
      twitterTitle: saved?.twitter_title || '',
      twitterDescription: saved?.twitter_description || '',
      twitterImage: saved?.twitter_image || '',
      author: saved?.author || '',
      publishedTime: toDateInputValue(saved?.published_time),
      modifiedTime: toDateInputValue(saved?.modified_time),
      focusKeyword: saved?.focus_keyword || '',
      schemaJson: saved?.schema_json ? formatJson(saved.schema_json) : ''
    });
  }

  function formatJson(raw) {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }

  function openCustom() {
    if (!customPath.trim()) return;
    openEditor({ path: customPath.trim(), label: customPath.trim() });
    setCustomPath('');
  }

  function updateField(field, value) {
    setEditing((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    setIsError(false);
    const res = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing)
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setIsError(true);
      setMessage(json.error || 'Save failed.');
      return;
    }
    setEditing(null);
    load();
  }

  async function handleDelete(row) {
    if (!row.saved?.id) return;
    if (!confirm(`Remove the SEO override for ${row.path}? The page will fall back to sitewide defaults.`)) return;
    await fetch(`/api/admin/seo/${row.saved.id}`, { method: 'DELETE' });
    if (editing?.pagePath === row.path) setEditing(null);
    load();
  }

  async function handleSaveDefaults() {
    setDefaultsSaving(true);
    setDefaultsMessage('');
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaults)
    });
    const json = await res.json();
    setDefaultsSaving(false);
    if (!res.ok) {
      setDefaultsMessage(json.error || 'Save failed.');
      return;
    }
    setDefaultsMessage('Sitewide defaults saved.');
  }

  const resolvedTitle = editing?.metaTitle || defaults.defaultMetaTitle || 'Untitled page';
  const resolvedDescription = editing?.metaDescription || defaults.defaultMetaDescription || '';
  const resolvedOgImage = editing?.ogImage || defaults.defaultOgImage || '';

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-navy mb-1">SEO</h1>
      <p className="text-sm text-inkgray mb-6">
        Manage meta title, description, canonical URL, robots, Open Graph, Twitter Cards and
        Schema.org/JSON-LD for every page on the site — including custom, service, industry and
        insight pages created from the admin panel. Changes take effect on the live site
        immediately, no code changes required.
      </p>

      {/* --- Sitewide defaults, used whenever a page has no override of its own --- */}
      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card mb-6">
        <button
          onClick={() => setDefaultsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <p className="text-sm font-semibold text-navy">Global SEO Defaults</p>
            <p className="text-xs text-inkgray">
              Sitewide fallbacks for title, description, social image, Twitter handle and
              organization schema. Used whenever a page has no per-page override.
            </p>
          </div>
          <span className="text-xs font-semibold text-brandblue">{defaultsOpen ? 'Hide' : 'Edit'}</span>
        </button>
        {defaultsOpen && (
          <div className="border-t border-gray-100 p-6 space-y-4">
            {defaultsLoading ? (
              <p className="text-sm text-inkgray">Loading…</p>
            ) : (
              <>
                <Field label="Site URL (used to build canonical & OG URLs)">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="https://www.chromatusconsulting.com"
                    value={defaults.siteUrl}
                    onChange={(e) => setDefaults({ ...defaults, siteUrl: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-inkgray">
                    Also set NEXT_PUBLIC_SITE_URL in your environment — it takes priority at build/runtime.
                  </p>
                </Field>
                <Field label="Default meta title">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={defaults.defaultMetaTitle}
                    onChange={(e) => setDefaults({ ...defaults, defaultMetaTitle: e.target.value })}
                  />
                </Field>
                <Field label="Default meta description">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    value={defaults.defaultMetaDescription}
                    onChange={(e) => setDefaults({ ...defaults, defaultMetaDescription: e.target.value })}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Default social preview image URL">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={defaults.defaultOgImage}
                      onChange={(e) => setDefaults({ ...defaults, defaultOgImage: e.target.value })}
                    />
                  </Field>
                  <Field label="Twitter handle (e.g. @chromatus)">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={defaults.twitterHandle}
                      onChange={(e) => setDefaults({ ...defaults, twitterHandle: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Organization name (Schema.org)">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={defaults.organizationName}
                      onChange={(e) => setDefaults({ ...defaults, organizationName: e.target.value })}
                    />
                  </Field>
                  <Field label="Organization logo URL (Schema.org)">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={defaults.organizationLogo}
                      onChange={(e) => setDefaults({ ...defaults, organizationLogo: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Organization description (Schema.org, optional)">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    value={defaults.organizationDescription}
                    onChange={(e) => setDefaults({ ...defaults, organizationDescription: e.target.value })}
                  />
                </Field>
                {defaultsMessage && <p className="text-sm text-green-700">{defaultsMessage}</p>}
                <button
                  onClick={handleSaveDefaults}
                  disabled={defaultsSaving}
                  className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {defaultsSaving ? 'Saving…' : 'Save defaults'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Add a path not listed below, e.g. /insights/article/my-article-slug"
          value={customPath}
          onChange={(e) => setCustomPath(e.target.value)}
        />
        <button onClick={openCustom} className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
          Edit SEO
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card mb-6">
          <div className="p-6 pb-0 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">{editing.pagePath}</p>
            <div className="flex items-center gap-3">
              <a
                href={editing.pagePath}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-brandblue hover:underline"
              >
                Preview live page ↗
              </a>
              {seoScore && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${scoreLabel(seoScore.score).className}`}
                  title="SEO score — how well this page's metadata follows on-page SEO best practices"
                >
                  SEO score: {seoScore.score}/100 · {scoreLabel(seoScore.score).text}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap ${
                  activeTab === tab ? 'bg-bglight text-navy border-b-2 border-brandorange' : 'text-inkgray'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {activeTab === 'General' && (
              <>
                <Field label="Meta title" hint={`${(editing.metaTitle || '').length}/60 recommended`}>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editing.metaTitle}
                    onChange={(e) => updateField('metaTitle', e.target.value)}
                  />
                </Field>
                <Field label="Meta description" hint={`${(editing.metaDescription || '').length}/160 recommended`}>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    value={editing.metaDescription}
                    onChange={(e) => updateField('metaDescription', e.target.value)}
                  />
                </Field>
                <Field label="Focus keyword">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editing.focusKeyword}
                    onChange={(e) => updateField('focusKeyword', e.target.value)}
                  />
                </Field>
                <Field label="Meta keywords (comma-separated)">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="market research, data analytics, consulting"
                    value={editing.metaKeywords}
                    onChange={(e) => updateField('metaKeywords', e.target.value)}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Canonical URL (optional — defaults to this page's own URL)">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={editing.canonicalUrl}
                      onChange={(e) => updateField('canonicalUrl', e.target.value)}
                    />
                  </Field>
                  <Field label="Author">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={editing.author}
                      onChange={(e) => updateField('author', e.target.value)}
                    />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Published date">
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={editing.publishedTime}
                      onChange={(e) => updateField('publishedTime', e.target.value)}
                    />
                  </Field>
                  <Field label="Last modified date">
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={editing.modifiedTime}
                      onChange={(e) => updateField('modifiedTime', e.target.value)}
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm text-inkgray">
                    <input
                      type="checkbox"
                      checked={editing.robotsIndex}
                      onChange={(e) => updateField('robotsIndex', e.target.checked)}
                    />
                    Index (allow search engines to list this page)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-inkgray">
                    <input
                      type="checkbox"
                      checked={editing.robotsFollow}
                      onChange={(e) => updateField('robotsFollow', e.target.checked)}
                    />
                    Follow links on this page
                  </label>
                </div>

                <div className="rounded-lg border border-gray-100 p-4 mt-4">
                  <p className="text-xs font-semibold text-inkgray uppercase tracking-wide mb-2">Google preview</p>
                  <p className="text-[#1a0dab] text-lg leading-tight truncate">{resolvedTitle}</p>
                  <p className="text-[#006621] text-sm">{`chromatusconsulting.com${editing.pagePath}`}</p>
                  <p className="text-sm text-[#545454] line-clamp-2">{resolvedDescription}</p>
                </div>

                {seoScore && (
                  <div className="rounded-lg border border-gray-100 p-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">SEO checklist</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreLabel(seoScore.score).className}`}
                      >
                        {seoScore.score}/100
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {seoScore.results.map((r) => (
                        <li key={r.id} className="text-xs flex items-start gap-2">
                          <span className={r.pass ? 'text-green-600' : 'text-amber-600'}>{r.pass ? '✓' : '!'}</span>
                          <span className={r.pass ? 'text-inkgray' : 'text-amber-800'}>{r.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === 'Open Graph' && (
              <>
                <Field label="OG title (falls back to meta title)">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editing.ogTitle}
                    onChange={(e) => updateField('ogTitle', e.target.value)}
                  />
                </Field>
                <Field label="OG description (falls back to meta description)">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    value={editing.ogDescription}
                    onChange={(e) => updateField('ogDescription', e.target.value)}
                  />
                </Field>
                <Field label="OG image URL (1200×630 recommended)">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editing.ogImage}
                    onChange={(e) => updateField('ogImage', e.target.value)}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="OG type">
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={editing.ogType}
                      onChange={(e) => updateField('ogType', e.target.value)}
                    >
                      <option value="website">website</option>
                      <option value="article">article</option>
                      <option value="profile">profile</option>
                    </select>
                  </Field>
                  <Field label="OG URL (optional — defaults to canonical URL)">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={editing.ogUrl}
                      onChange={(e) => updateField('ogUrl', e.target.value)}
                    />
                  </Field>
                </div>
                {resolvedOgImage && (
                  <div className="rounded-lg border border-gray-100 overflow-hidden mt-4 max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolvedOgImage} alt="" className="w-full h-40 object-cover bg-bglight" />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-navy truncate">{editing.ogTitle || resolvedTitle}</p>
                      <p className="text-xs text-inkgray line-clamp-2">{editing.ogDescription || resolvedDescription}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'Twitter' && (
              <>
                <Field label="Twitter card type">
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editing.twitterCard}
                    onChange={(e) => updateField('twitterCard', e.target.value)}
                  >
                    <option value="summary_large_image">summary_large_image</option>
                    <option value="summary">summary</option>
                  </select>
                </Field>
                <Field label="Twitter title (falls back to OG title)">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editing.twitterTitle}
                    onChange={(e) => updateField('twitterTitle', e.target.value)}
                  />
                </Field>
                <Field label="Twitter description (falls back to OG description)">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    value={editing.twitterDescription}
                    onChange={(e) => updateField('twitterDescription', e.target.value)}
                  />
                </Field>
                <Field label="Twitter image URL (falls back to OG image)">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editing.twitterImage}
                    onChange={(e) => updateField('twitterImage', e.target.value)}
                  />
                </Field>
              </>
            )}

            {activeTab === 'Schema & Advanced' && (
              <>
                <Field label="Custom Schema.org / JSON-LD (optional — overrides the auto-generated WebPage/Breadcrumb/Article schema for this page)">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                    rows={10}
                    placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Service",\n  "name": "..."\n}'}
                    value={editing.schemaJson}
                    onChange={(e) => updateField('schemaJson', e.target.value)}
                  />
                </Field>
                <p className="text-xs text-inkgray">
                  Leave blank to keep the automatic WebPage + Breadcrumb schema (and Article schema
                  for OG type &ldquo;article&rdquo;), built from this page&apos;s title, description, image and
                  breadcrumb trail. Paste any valid JSON-LD object here to fully replace it.
                </p>
              </>
            )}

            {duplicateWarnings.length > 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
                {duplicateWarnings.map((w) => (
                  <p key={w} className="text-xs text-amber-800">
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}

            {message && <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>{message}</p>}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-brandorange px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save SEO'}
              </button>
              <button onClick={() => setEditing(null)} className="text-sm font-semibold text-inkgray">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
        placeholder="Filter pages…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {filteredRows.map((row) => (
            <div key={row.path} className="w-full flex items-center justify-between px-5 py-4 hover:bg-bglight transition">
              <button onClick={() => openEditor(row)} className="min-w-0 text-left flex-1">
                <p className="text-sm font-medium text-navy truncate">{row.label}</p>
                <p className="text-xs text-inkgray">{row.path}</p>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                {row.saved && row.saved.robots_index === false && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                    Noindex
                  </span>
                )}
                {row.saved?.meta_title && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      scoreLabel(scoreSeoEntry(toScoreFields(row.saved)).score).className
                    }`}
                  >
                    {scoreSeoEntry(toScoreFields(row.saved)).score}/100
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    row.saved?.meta_title ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {row.saved?.meta_title ? 'Customized' : 'Default'}
                </span>
                {row.saved?.id && (
                  <button
                    onClick={() => handleDelete(row)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredRows.length === 0 && <p className="px-5 py-4 text-sm text-inkgray">No pages match your filter.</p>}
        </div>
      )}
    </div>
  );
}

function toScoreFields(saved) {
  if (!saved) return {};
  return {
    metaTitle: saved.meta_title || '',
    metaDescription: saved.meta_description || '',
    metaKeywords: saved.meta_keywords || '',
    focusKeyword: saved.focus_keyword || '',
    ogImage: saved.og_image || '',
    twitterImage: saved.twitter_image || ''
  };
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs text-inkgray">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
