"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import {
  aboutSection,
  servicesSection,
  industriesSection,
  insightsSection,
  careersSection,
} from "@/lib/content";

export type SearchResultItem = {
  title: string;
  href: string;
  section?: string;
  eyebrow?: string;
  summary?: string;
  type?: string;
};

// Static quick index for immediate 0ms responses while server search loads
const STATIC_CLIENT_ITEMS: SearchResultItem[] = [
  {
    title: "Home",
    href: "/",
    section: "Overview",
    eyebrow: "Chromatus Consulting",
    summary: "Research and consulting firm helping organizations make better business decisions through data.",
    type: "page",
  },
  {
    title: "About Overview",
    href: "/about",
    section: "About Us",
    eyebrow: "About Us",
    summary: "Our story, leadership, expertise, and how we approach research.",
    type: "about",
  },
  {
    title: "Services Overview",
    href: "/services",
    section: "Services",
    eyebrow: "Services",
    summary: "Research and consulting services built around a decision.",
    type: "service",
  },
  {
    title: "Industries",
    href: "/industries",
    section: "Industries",
    eyebrow: "Industries",
    summary: "Where industry knowledge meets business decisions across core sectors.",
    type: "industry",
  },
  {
    title: "Insights & Resources",
    href: "/insights",
    section: "Insights",
    eyebrow: "Insights",
    summary: "Thought leadership, industry reports, whitepapers, case studies, and resources.",
    type: "insight",
  },
  {
    title: "Careers",
    href: "/careers",
    section: "Careers",
    eyebrow: "Careers",
    summary: "Build your career around better questions.",
    type: "career",
  },
  {
    title: "Contact Us",
    href: "/contact",
    section: "Contact",
    eyebrow: "Contact",
    summary: "Connect with our research directors for data tailored to your specific business decisions.",
    type: "page",
  },
  {
    title: "Chromatus Pro",
    href: "/contact#contact-form",
    section: "Advisory",
    eyebrow: "Advisory Practice",
    summary: "Schedule a consultation and discuss custom research requirements.",
    type: "page",
  },
  {
    title: "Frequently Asked Questions",
    href: "/faq",
    section: "Resources",
    eyebrow: "FAQ",
    summary: "Common questions about our research methods, timelines, and deliverables.",
    type: "page",
  },
  // Subpages from content.ts
  ...aboutSection.items.map((it) => ({
    title: it.title,
    href: `${aboutSection.path}/${it.slug}`,
    section: "About Us",
    eyebrow: "About Us",
    summary: it.summary,
    type: "about",
  })),
  ...servicesSection.items.map((it) => ({
    title: it.title,
    href: `${servicesSection.path}/${it.slug}`,
    section: "Services",
    eyebrow: "Services",
    summary: it.summary,
    type: "service",
  })),
  ...industriesSection.items.map((it) => ({
    title: it.title,
    href: `${industriesSection.path}/${it.slug}`,
    section: "Industries",
    eyebrow: "Industries",
    summary: it.summary,
    type: "industry",
  })),
  ...insightsSection.items.map((it) => ({
    title: it.title,
    href: `${insightsSection.path}/${it.slug}`,
    section: "Insights",
    eyebrow: "Insights",
    summary: it.summary,
    type: "insight",
  })),
  ...careersSection.items.map((it) => ({
    title: it.title,
    href: `${careersSection.path}/${it.slug}`,
    section: "Careers",
    eyebrow: "Careers",
    summary: it.summary,
    type: "career",
  })),
];

const SUGGESTIONS = [
  "Consumer Behaviour",
  "Brand Management",
  "Market Assessment",
  "Healthcare",
  "Automotive",
  "Leadership Team",
];

export default function SearchToggle({
  className = "",
  buttonLabel,
  showFullTrigger = false,
}: {
  className?: string;
  buttonLabel?: string;
  showFullTrigger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Keyboard shortcut Ctrl+K / Cmd+K to open, Escape to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Live search: instant client-side filtering + debounced server fetch
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // 1. Instant client-side match
    const clientMatches = STATIC_CLIENT_ITEMS.filter((item) => {
      const title = item.title.toLowerCase();
      const summary = (item.summary || "").toLowerCase();
      const section = (item.section || "").toLowerCase();
      return title.includes(q) || summary.includes(q) || section.includes(q);
    });
    setResults(clientMatches.slice(0, 8));
    setSelectedIndex(0);

    // 2. Fetch comprehensive search from server API (includes DB insights, articles, custom pages)
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.results) && data.results.length > 0) {
            setResults(data.results);
            setSelectedIndex(0);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            // Keep client matches
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 120);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function navigateTo(href: string) {
    setOpen(false);
    startTransition(() => {
      router.push(href);
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (results.length > 0 && results[selectedIndex]) {
      navigateTo(results[selectedIndex].href);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }
  }

  const getSectionBadgeClass = (type?: string) => {
    switch (type) {
      case "service":
        return "bg-brandblue/10 text-brandblue border-brandblue/20";
      case "industry":
        return "bg-brandorange/10 text-brandorange border-brandorange/20";
      case "article":
      case "insight":
        return "bg-indigo/10 text-indigo-dark border-indigo/20";
      case "career":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "about":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-paper-dim text-slate border-line";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {showFullTrigger ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-paper/20 bg-white/5 px-3 py-2.5 text-left text-sm text-paper/75 transition hover:bg-white/10 hover:text-paper"
        >
          <span className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 17 17" fill="none" className="text-paper/60">
              <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{buttonLabel || "Search Chromatus…"}</span>
          </span>
          <span className="rounded border border-paper/20 px-1.5 py-0.5 font-mono text-[10px] text-paper/60">
            Search
          </span>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Search"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-paper/85 transition hover:bg-paper/10 hover:text-paper focus:outline-none focus:ring-2 focus:ring-paper/30"
          title="Search (Ctrl+K)"
        >
          <svg width="18" height="18" viewBox="0 0 17 17" fill="none">
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Modal Dialog */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-14 sm:p-6 sm:pt-20 bg-ink/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl transition-all">
            {/* Input Header */}
            <form onSubmit={handleSubmit} className="relative flex items-center border-b border-line px-4 py-3 sm:px-5">
              <svg width="18" height="18" viewBox="0 0 17 17" fill="none" className="shrink-0 text-slate">
                <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search services, industries, insights, careers…"
                className="w-full bg-transparent px-3 text-sm text-ink outline-none placeholder:text-slate/70 sm:text-base"
              />
              {loading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate/30 border-t-indigo" />
              )}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded p-1 text-xs text-slate hover:bg-paper-dim hover:text-ink mr-2"
                  aria-label="Clear input"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line px-2 py-1 font-mono text-[11px] text-slate hover:bg-paper-dim hover:text-ink"
              >
                ESC
              </button>
            </form>

            {/* Results or Suggestions */}
            <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3">
              {results.length > 0 ? (
                <ul className="space-y-1">
                  {results.map((r, idx) => (
                    <li key={`${r.href}-${idx}`}>
                      <Link
                        href={r.href}
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`block rounded-xl px-3.5 py-3 transition ${
                          selectedIndex === idx
                            ? "bg-paper-dim text-ink shadow-sm"
                            : "text-ink/80 hover:bg-paper-dim/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-semibold text-ink">
                            {r.title}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${getSectionBadgeClass(
                              r.type
                            )}`}
                          >
                            {r.eyebrow || r.section || "Page"}
                          </span>
                        </div>
                        {r.summary && (
                          <p className="mt-1 line-clamp-1 text-xs text-slate">{r.summary}</p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query.trim().length >= 2 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-ink">No results for &ldquo;{query}&rdquo;</p>
                  <p className="mt-1 text-xs text-slate">
                    Check your spelling or try searching for a service, sector, or keyword.
                  </p>
                </div>
              ) : (
                <div className="px-3 py-4 sm:px-4">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate">
                    Popular Topics
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs text-ink transition hover:border-indigo hover:bg-indigo/5 hover:text-indigo-dark"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="flex items-center justify-between border-t border-line bg-paper-dim/50 px-4 py-2.5 text-[11px] text-slate">
              <span className="flex items-center gap-2">
                <span className="font-medium text-ink">Navigation:</span>
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </span>
              <span>Chromatus Research Intelligence</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
