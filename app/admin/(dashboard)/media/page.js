'use client';

import { useEffect, useRef, useState } from 'react';

export default function AdminMediaPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setLoading(true);
    fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => setMedia(data.media || []))
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed.');
      } else {
        load();
      }
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this file? It will stop working anywhere it is referenced.')) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  function copyUrl(m) {
    navigator.clipboard?.writeText(m.url);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-navy">Media Library</h1>
        <label className="rounded-full bg-brandorange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition cursor-pointer">
          {uploading ? 'Uploading…' : 'Upload image'}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <p className="text-sm text-inkgray mb-6">JPEG, PNG, WebP, GIF or SVG, up to 8MB.</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : media.length === 0 ? (
        <p className="text-sm text-inkgray">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {media.map((m) => (
            <div key={m.id} className="bg-white rounded-xl2 border border-gray-100 shadow-card overflow-hidden">
              <div className="aspect-square bg-bglight">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt_text || m.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs text-navy truncate" title={m.filename}>{m.filename}</p>
                <div className="flex items-center justify-between mt-2">
                  <button onClick={() => copyUrl(m)} className="text-xs font-semibold text-brandblue hover:text-brandblue-dark">
                    {copiedId === m.id ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
