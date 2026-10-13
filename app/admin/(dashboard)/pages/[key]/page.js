'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FieldEditor from '@/components/admin/ContentEditor';
import PreviewDraftButton from '@/components/admin/PreviewDraftButton';

export default function EditPageContentPage() {
  const { key } = useParams();
  const router = useRouter();

  const [meta, setMeta] = useState(null);
  const [data, setData] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [fallback, setFallback] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/content/${key}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json) return;
        setMeta(json.meta);
        setData(json.current);
        setFallback(json.fallback);
        setIsPublished(json.isPublished);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [key]);

  async function handleSave(publish) {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, isPublished: publish })
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || 'Save failed.');
        setSaving(false);
        return;
      }
      setIsPublished(publish);
      setMessage(publish ? 'Published — changes are live on the site.' : 'Draft saved.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleResetToDefault() {
    if (!fallback) return;
    if (!confirm('Reset this editor to the original default content? This does not save until you click Save.')) return;
    setData(JSON.parse(JSON.stringify(fallback)));
  }

  if (notFound) {
    return (
      <div>
        <p className="text-sm text-red-600">Unknown page key.</p>
        <Link href="/admin/pages" className="text-brandblue text-sm">← Back to Pages</Link>
      </div>
    );
  }

  if (loading || !data) {
    return <p className="text-sm text-inkgray">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/pages" className="text-xs text-brandblue font-semibold">← Back to Pages</Link>

      <div className="flex items-center justify-between mt-2 mb-1">
        <h1 className="text-2xl font-bold text-navy">{meta?.label}</h1>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isPublished ? 'Published' : 'Draft'}
        </span>
      </div>
      <p className="text-sm text-inkgray mb-6">
        Live at{' '}
        <a href={meta?.route} target="_blank" rel="noreferrer" className="text-brandblue underline">
          {meta?.route}
        </a>
      </p>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6">
        <FieldEditor value={data} onChange={setData} />
      </div>

      <div className="sticky bottom-0 mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 bg-bglight/95 backdrop-blur-md py-4 border-t sm:border-t-0 border-gray-200 flex flex-wrap items-center gap-2.5 sm:gap-3 z-20">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="rounded-full border border-navy text-navy px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-navy/5 transition disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="rounded-full bg-brandorange px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-brandorange-dark transition disabled:opacity-60 shadow-xs"
        >
          {saving ? 'Saving…' : 'Publish'}
        </button>
        {meta?.route && <PreviewDraftButton route={meta.route} />}
        {isPublished && (
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="text-xs sm:text-sm font-semibold text-inkgray hover:text-navy px-2 py-1"
          >
            Unpublish
          </button>
        )}
        <button
          onClick={handleResetToDefault}
          className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm font-semibold text-inkgray hover:text-red-600 text-left sm:text-right pt-1 sm:pt-0"
        >
          Reset to default
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-navy">{message}</p>}
    </div>
  );
}
