'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_ASSETS = [
  { name: 'Chromatus Full Logo', url: '/logo-full.png' },
  { name: 'Chromatus Icon Mark', url: '/logo-icon.png' },
];

export default function MediaPickerButton({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [tab, setTab] = useState('library'); // 'library' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  function loadMedia() {
    setLoading(true);
    setUploadError('');
    fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => setMedia(data.media || []))
      .catch(() => setUploadError('Failed to load media library.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!open) return;
    loadMedia();
  }, [open]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Upload failed.');
      } else {
        if (data.url) {
          onSelect(data.url);
          setOpen(false);
        } else {
          loadMedia();
        }
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleUrlSubmit(e) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onSelect(urlInput.trim());
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="whitespace-nowrap text-xs font-semibold text-brandblue hover:text-brandblue-dark border border-brandblue/30 hover:border-brandblue rounded-lg px-3 py-2 transition"
      >
        Browse media
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-navy">Select or upload an image</h3>
                <p className="text-xs text-inkgray mt-0.5">
                  Pick an existing image, upload from your device, or paste a link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-inkgray hover:text-navy hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Tabs & Actions */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTab('library')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                    tab === 'library'
                      ? 'bg-white text-navy shadow-xs'
                      : 'text-inkgray hover:text-navy'
                  }`}
                >
                  Media Library ({media.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('url')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                    tab === 'url'
                      ? 'bg-white text-navy shadow-xs'
                      : 'text-inkgray hover:text-navy'
                  }`}
                >
                  External / Direct URL
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brandorange hover:bg-brandorange-dark text-white px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-xs">
                  <span>{uploading ? 'Uploading…' : '+ Upload new'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {uploadError}
                </div>
              )}

              {tab === 'library' && (
                <div>
                  {loading ? (
                    <div className="py-12 text-center text-sm text-inkgray">
                      Loading media files…
                    </div>
                  ) : media.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 text-brandblue flex items-center justify-center text-xl font-bold">
                        📁
                      </div>
                      <h4 className="text-sm font-semibold text-navy mb-1">No media uploaded yet</h4>
                      <p className="text-xs text-inkgray max-w-sm mx-auto mb-4">
                        Upload an image directly from your computer, or pick one of the default assets below.
                      </p>
                      <label className="inline-flex items-center gap-2 bg-brandblue hover:bg-brandblue-dark text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition">
                        <span>{uploading ? 'Uploading…' : 'Choose image to upload'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {media.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            onSelect(m.url);
                            setOpen(false);
                          }}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-brandblue hover:ring-2 hover:ring-brandblue/20 transition text-left bg-gray-50"
                          title={m.filename}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.url}
                            alt={m.alt_text || m.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition">
                            <p className="text-[10px] text-white truncate font-medium">{m.filename}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Brand Starter Assets */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-navy mb-2">Default Brand Assets</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DEFAULT_ASSETS.map((asset) => (
                        <button
                          key={asset.url}
                          type="button"
                          onClick={() => {
                            onSelect(asset.url);
                            setOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-200 hover:border-brandblue hover:bg-blue-50/50 transition text-left"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-8 h-8 object-contain bg-white rounded border border-gray-100 p-0.5"
                          />
                          <div className="truncate">
                            <p className="text-xs font-medium text-navy truncate">{asset.name}</p>
                            <p className="text-[10px] text-inkgray truncate">{asset.url}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'url' && (
                <form onSubmit={handleUrlSubmit} className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
                    />
                    <p className="text-[11px] text-inkgray mt-1.5">
                      You can paste any web image URL or relative site asset path.
                    </p>
                  </div>

                  {urlInput.trim() && (
                    <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={urlInput.trim()}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-navy font-medium">Image preview</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!urlInput.trim()}
                      className="bg-brandblue hover:bg-brandblue-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                      Use this URL
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-inkgray">
              <span>Supports JPEG, PNG, WebP, GIF, SVG</span>
              <a
                href="/admin/media"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brandblue hover:underline inline-flex items-center gap-1"
              >
                Open Media Library in new tab ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
