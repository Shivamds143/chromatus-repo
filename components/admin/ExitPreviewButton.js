'use client';

export default function ExitPreviewButton() {
  async function handleExit() {
    await fetch('/api/admin/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: false })
    });
    window.location.reload();
  }

  return (
    <button
      onClick={handleExit}
      className="underline underline-offset-2 hover:text-navy transition"
    >
      Exit preview
    </button>
  );
}
