"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  aboutSection,
  servicesSection,
  insightsSection,
  careersSection,
} from "@/lib/content";

export default function SearchToggle() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [liveServices, setLiveServices] = useState<any[]>(servicesSection.items);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data?.items) && data.items.length > 0) {
          setLiveServices(
            data.items.map((it: any) => ({
              slug: it.slug,
              title: it.title,
              summary: it.summary,
              href: it.href,
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const currentSections = [
    aboutSection,
    { ...servicesSection, items: liveServices },
    insightsSection,
    careersSection,
  ];

  const results =
    query.trim().length > 1
      ? currentSections
          .flatMap((s) => s.items.map((item: any) => ({ ...item, section: s })))
          .filter((item) =>
            `${item.title} ${item.summary || ""}`.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 6)
      : [];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (results[0]) {
      const href = results[0].href || `${results[0].section.path}/${results[0].slug}`;
      router.push(href);
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div className="relative">
      <button
        aria-label="Search"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-paper/75 transition hover:bg-paper/10 hover:text-paper"
      >
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 rounded-xl border border-line bg-white p-3 shadow-xl shadow-ink/5">
          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Chromatus…"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-indigo"
            />
          </form>
          {results.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {results.map((r: any) => (
                <li key={`${r.section.key}-${r.slug}`}>
                  <a
                    href={r.href || `${r.section.path}/${r.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-paper-dim"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-ink">{r.title}</span>
                    <span className="ml-2 text-xs text-slate">{r.section.eyebrow}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {query.trim().length > 1 && results.length === 0 && (
            <p className="mt-2 px-3 py-2 text-xs text-slate">No matches yet — try another term.</p>
          )}
        </div>
      )}
    </div>
  );
}
