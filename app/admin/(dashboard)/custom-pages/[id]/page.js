'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FieldEditor from '@/components/admin/ContentEditor';
import PreviewDraftButton from '@/components/admin/PreviewDraftButton';

// Mirrors the type/label pairs in src/lib/customPages.js (kept small and
// duplicated here so this client component never imports the MySQL-backed
// server library).
const SECTION_TYPE_OPTIONS = [
  { type: 'hero', label: 'Hero banner' },
  { type: 'richtext', label: 'Rich text block' },
  { type: 'cards', label: 'Card grid' },
  { type: 'stats', label: 'Stats band' },
  { type: 'image_text', label: 'Image + text' },
  { type: 'cta', label: 'Call to action' },
  { type: 'testimonials', label: 'Testimonials (published library)' },
  { type: 'faq', label: 'FAQs (published library)' }
];

const PAGE_TYPE_META = {
  custom: { backLabel: '← Back to Custom Pages', backHref: '/admin/custom-pages', routePrefix: '/pages' },
  service: { backLabel: '← Back to Services', backHref: '/admin/services', routePrefix: '/services' },
  industry: { backLabel: '← Back to Industries', backHref: '/admin/industries', routePrefix: '/industries' }
};

function typeLabel(type) {
  return SECTION_TYPE_OPTIONS.find((t) => t.type === type)?.label || type;
}

export default function CustomPageEditor() {
  const { id } = useParams();
  const router = useRouter();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [message, setMessage] = useState('');
  const [addingType, setAddingType] = useState(SECTION_TYPE_OPTIONS[0].type);
  const [savingMeta, setSavingMeta] = useState(false);

  function load() {
    setLoading(true);
    fetch(`/api/admin/custom-pages/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setPage(json.page);
        if (json.page) {
          setMeta({
            title: json.page.title,
            slug: json.page.slug,
            metaDescription: json.page.meta_description || '',
            isPublished: !!json.page.is_published
          });
        }
      })
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [id]);

  async function handleSaveMeta() {
    setSavingMeta(true);
    setMessage('');
    const res = await fetch(`/api/admin/custom-pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta)
    });
    const json = await res.json();
    setSavingMeta(false);
    if (!res.ok) {
      setMessage(json.error || 'Save failed.');
      return;
    }
    setMessage('Saved.');
    load();
  }

  async function handleDeletePage() {
    if (!confirm('Delete this entire page and all its sections? This cannot be undone.')) return;
    await fetch(`/api/admin/custom-pages/${id}`, { method: 'DELETE' });
    router.push(PAGE_TYPE_META[page.page_type]?.backHref || '/admin/custom-pages');
  }

  async function handleAddSection() {
    await fetch(`/api/admin/custom-pages/${id}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: addingType })
    });
    load();
  }

  async function handleSaveSection(sectionId, data) {
    await fetch(`/api/admin/custom-pages/${id}/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    load();
  }

  async function handleDeleteSection(sectionId) {
    if (!confirm('Remove this section?')) return;
    await fetch(`/api/admin/custom-pages/${id}/sections/${sectionId}`, { method: 'DELETE' });
    load();
  }

  async function moveSection(index, dir) {
    const sections = page.sections;
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setPage({ ...page, sections: next });
    await fetch(`/api/admin/custom-pages/${id}/sections`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((s) => s.id) })
    });
  }

  if (loading || !page || !meta) return <p className="text-sm text-inkgray">Loading…</p>;

  const typeMeta = PAGE_TYPE_META[page.page_type] || PAGE_TYPE_META.custom;

  return (
    <div className="max-w-3xl">
      <Link href={typeMeta.backHref} className="text-xs text-brandblue font-semibold">
        {typeMeta.backLabel}
      </Link>

      <div className="flex items-center justify-between mt-2 mb-6">
        <h1 className="text-2xl font-bold text-navy">{page.title}</h1>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            meta.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {meta.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Page settings */}
      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-4 mb-8">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Page settings</p>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Title"
          value={meta.title}
          onChange={(e) => setMeta({ ...meta, title: e.target.value })}
        />
        <div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-inkgray">{typeMeta.routePrefix}/</span>
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={meta.slug}
              onChange={(e) => setMeta({ ...meta, slug: e.target.value })}
            />
          </div>
        </div>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          rows={2}
          placeholder="Meta description (optional, for SEO)"
          value={meta.metaDescription}
          onChange={(e) => setMeta({ ...meta, metaDescription: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={meta.isPublished}
            onChange={(e) => setMeta({ ...meta, isPublished: e.target.checked })}
          />
          Published (live on the site)
        </label>
        {message && <p className="text-sm text-inkgray">{message}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveMeta}
            disabled={savingMeta}
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {savingMeta ? 'Saving…' : 'Save page settings'}
          </button>
          <PreviewDraftButton route={`${typeMeta.routePrefix}/${meta.slug}`} />
          <button onClick={handleDeletePage} className="text-sm font-semibold text-red-600 ml-auto">
            Delete page
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-navy uppercase tracking-wide">
          Sections ({page.sections.length})
        </p>
        <div className="flex items-center gap-2">
          <select
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            value={addingType}
            onChange={(e) => setAddingType(e.target.value)}
          >
            {SECTION_TYPE_OPTIONS.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddSection}
            className="rounded-full bg-brandorange px-4 py-1.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition"
          >
            + Add section
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {page.sections.length === 0 && (
          <p className="text-sm text-inkgray">
            No sections yet — add one above to start building this page.
          </p>
        )}
        {page.sections.map((section, i) => (
          <SectionCard
            key={section.id}
            section={section}
            index={i}
            total={page.sections.length}
            onMove={moveSection}
            onSave={handleSaveSection}
            onDelete={handleDeleteSection}
          />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ section, index, total, onMove, onSave, onDelete }) {
  const [data, setData] = useState(section.data);
  const [saving, setSaving] = useState(false);
  const editable = section.type !== 'testimonials' && section.type !== 'faq';

  async function handleSave() {
    setSaving(true);
    await onSave(section.id, data);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-navy">{typeLabel(section.type)}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onMove(index, -1)} disabled={index === 0} className="text-inkgray hover:text-navy disabled:opacity-30">
            ↑
          </button>
          <button
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="text-inkgray hover:text-navy disabled:opacity-30"
          >
            ↓
          </button>
          <button onClick={() => onDelete(section.id)} className="text-xs font-semibold text-red-600 ml-2">
            Remove
          </button>
        </div>
      </div>

      {editable ? (
        <>
          <FieldEditor value={data} onChange={setData} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save section'}
          </button>
        </>
      ) : (
        <p className="text-xs text-inkgray">
          Pulls automatically from the published {section.type === 'testimonials' ? 'Testimonials' : 'FAQs'} list —
          manage the content from that page in the sidebar.
        </p>
      )}
    </div>
  );
}
