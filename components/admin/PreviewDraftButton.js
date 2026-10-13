'use client';

export default function PreviewDraftButton({ route }) {
  async function handlePreview() {
    await fetch('/api/admin/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: true })
    });
    window.open(route, '_blank', 'noopener');
  }

  return (
    <button
      type="button"
      onClick={handlePreview}
      className="rounded-full border border-brandblue text-brandblue px-5 py-2.5 text-sm font-semibold hover:bg-brandblue/5 transition"
    >
      Preview draft
    </button>
  );
}
