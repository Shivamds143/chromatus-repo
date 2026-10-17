import Link from "next/link";
import Container from "./Container";
import CTABanner from "./CTABanner";
import SubpageBand from "./SubpageBand";
import Icon from "./Icon";
import type { Section, SubItem } from "@/lib/content";

export function parseInlineMarkdown(str: string): React.ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|<b>.*?<\/b>|<i>.*?<\/i>)/g;
  const parts = str.split(regex);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("<b>") && part.endsWith("</b>")) {
      return <strong key={idx} className="font-bold text-ink">{part.slice(3, -4)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="italic text-ink/85">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("<i>") && part.endsWith("</i>")) {
      return <em key={idx} className="italic text-ink/85">{part.slice(3, -4)}</em>;
    }
    return part;
  });
}

export function renderFormattedParagraph(para: string, key: any) {
  const trimmed = para.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("### ")) {
    return (
      <h4 key={key} className="font-display text-base sm:text-lg font-bold text-ink mt-5 mb-2 tracking-tight flex items-center gap-2">
        <span className="h-3.5 w-1 bg-signal rounded-full shrink-0" aria-hidden="true" />
        <span>{parseInlineMarkdown(trimmed.replace(/^###\s+/, ""))}</span>
      </h4>
    );
  }
  if (trimmed.startsWith("## ")) {
    return (
      <h3 key={key} className="font-display text-lg sm:text-xl font-bold text-ink mt-6 mb-2 tracking-tight flex items-center gap-2.5">
        <span className="h-4 w-1 bg-signal rounded-full shrink-0" aria-hidden="true" />
        <span>{parseInlineMarkdown(trimmed.replace(/^##\s+/, ""))}</span>
      </h3>
    );
  }

  // Check if paragraph starts with a labeled bold headline like "**Who we are:** ..." or "Who we are: ..."
  const boldPrefixMatch = trimmed.match(/^(\*\*[^*]+:\*\*|\*\*[^*]+\*\*:?|^[A-Z][A-Za-z0-9\s,&'/-]{1,40}:)\s*(.*)$/);
  if (boldPrefixMatch) {
    const rawHeadline = boldPrefixMatch[1].replace(/^\*\*|\*\*$/g, "").replace(/:$/, "").trim();
    const rest = boldPrefixMatch[2];
    return (
      <p key={key} className="text-sm leading-relaxed text-ink/75 sm:text-[0.95rem]">
        <strong className="font-display font-bold text-ink text-[0.98rem] sm:text-base mr-1.5 block sm:inline">
          {rawHeadline}:
        </strong>{" "}
        {parseInlineMarkdown(rest)}
      </p>
    );
  }

  return (
    <p key={key} className="text-sm leading-relaxed text-ink/75 sm:text-[0.95rem]">
      {parseInlineMarkdown(trimmed)}
    </p>
  );
}

import HeaderIllustration from "./HeaderIllustration";

const KNOWN_STATIC_PAGE_IMAGES: Record<string, string[]> = {
  services: [
    "baseline-endline-study",
    "brand-management",
    "consumer-behaviour",
    "government-surveys",
    "location-feasibility-study",
    "market-assessment",
    "new-product-launch",
    "price-benchmarking",
    "satisfaction-studies",
  ],
  about: [
    "leadership-team",
    "our-approach",
    "our-story",
    "values-culture",
  ],
  insights: [
    "case-studies",
    "industry-reports",
    "news-updates",
    "whitepapers",
  ],
};

export default function SectionDetail({
  section,
  item,
  children,
  imageSrc,
}: {
  section: Section;
  item: SubItem;
  children?: React.ReactNode;
  imageSrc?: string;
}) {
  const otherItems = section.items.filter((i) => i.slug !== item.slug);
  const isKnownStatic = KNOWN_STATIC_PAGE_IMAGES[section.key]?.includes(item.slug);
  const resolvedImageSrc =
    imageSrc && imageSrc.trim() !== ""
      ? imageSrc.trim()
      : (isKnownStatic ? `/${section.key}/${item.slug}.png` : undefined);

  return (
    <>
      <SubpageBand waveClass="text-paper-dim">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <Link
              href={section.path}
              className="mono-tag inline-flex items-center gap-2 text-paper/60 transition hover:text-white"
            >
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {section.eyebrow}
            </Link>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {item.title}
            </h1>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-paper/75">{item.summary}</p>
          </div>

          {/* Section Illustration placed in header band */}
          <HeaderIllustration src={resolvedImageSrc} alt={item.title} />
        </div>
      </SubpageBand>

      {/* overflow-clip (not overflow-hidden) so the sticky sidebar keeps working */}
      <section className="relative overflow-clip bg-paper-dim pb-24 pt-2 sm:pt-4">
        <svg
          viewBox="0 0 500 500"
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-16 hidden h-[320px] w-[320px] opacity-40 lg:block"
        >
          <polygon points="250,20 445,135 445,365 250,480 55,365 55,135" fill="none" stroke="#1F82C5" strokeWidth="2" />
          <polygon points="250,100 375,172 375,328 250,400 125,328 125,172" fill="none" stroke="#EA9322" strokeWidth="2" />
          <polygon points="250,180 305,212 305,288 250,320 195,288 195,212" fill="none" stroke="#F2AC52" strokeWidth="2" />
        </svg>

        {/* Layout: Blue Information Box on the LEFT, White Information Box on the RIGHT */}
        <Container className="relative grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-12">
          {/* Left: Blue Information Box */}
          <aside className="self-start rounded-2xl bg-ink p-6 lg:sticky lg:top-24 order-2 lg:order-1 text-white shadow-card">
            <p className="eyebrow eyebrow-dark">More in {section.eyebrow}</p>
            <ul className="mt-4">
              {otherItems.map((other) => (
                <li key={other.slug} className="border-t border-paper/10">
                  <Link
                    href={`${section.path}/${other.slug}`}
                    className="group flex items-center justify-between gap-4 py-3.5 text-sm text-paper/85 transition hover:text-white"
                  >
                    {other.title}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                      className="flex-shrink-0 text-paper/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal-light"
                    >
                      <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Quick Advisory CTA within the blue box */}
            <div className="mt-8 rounded-xl bg-ink-soft/90 border border-white/10 p-4">
              <p className="mono-tag !text-signal-light text-[11px]">Advisory Practice</p>
              <p className="mt-1.5 text-xs text-paper/80 leading-relaxed">
                Connect with our research directors for data tailored to your specific business decisions.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white underline underline-offset-4 hover:text-signal transition"
              >
                Schedule consultation &rarr;
              </Link>
            </div>
          </aside>

          {/* Right: Main White Information Box */}
          <div className="rounded-2xl border border-line bg-white p-7 shadow-card sm:p-10 order-1 lg:order-2">
            <span className="mb-6 block h-[3px] w-9 bg-signal" aria-hidden="true" />
            <div className="space-y-6">
              {item.sections && item.sections.length > 0 ? (
                <div className="space-y-6">
                  {item.sections.map((sec, i) => (
                    <div key={i} className="space-y-2">
                      {sec.heading && (
                        <h3 className="font-display text-lg sm:text-xl font-bold text-ink tracking-tight flex items-center gap-2.5">
                          <span className="h-4 w-1 bg-signal rounded-full shrink-0" aria-hidden="true" />
                          <span>{parseInlineMarkdown(sec.heading)}</span>
                        </h3>
                      )}
                      <div className="text-sm leading-relaxed text-ink/75 sm:text-[0.95rem]">
                        {renderFormattedParagraph(sec.body, `sec-body-${i}`)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {item.body.map((para, i) => renderFormattedParagraph(para, i))}
                </div>
              )}

              {/* Injected Visual Boxes (if passed via item and no children) */}
              {!children && (item.metrics || item.tiles || item.steps || item.outcomeText) && (
                <div className="!mt-12 space-y-12">
                  {item.metrics && item.metrics.length > 0 && (
                    <section aria-labelledby="custom-metrics">
                      <h2 id="custom-metrics" className="eyebrow">
                        {item.metricsTitle || "Key Highlights"}
                      </h2>
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {item.metrics.map((m, idx) => (
                          <div
                            key={m.label || idx}
                            className="rounded-xl border border-line bg-bglight p-4 transition hover:border-indigo/40"
                          >
                            <div className="font-display text-2xl font-bold text-indigo sm:text-3xl">
                              {m.value}
                            </div>
                            <div className="mt-1 font-display text-xs font-semibold uppercase tracking-wider text-ink">
                              {m.label}
                            </div>
                            {m.detail && <p className="mt-1 text-[11px] leading-relaxed text-slate">{m.detail}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {item.tiles && item.tiles.length > 0 && (
                    <section aria-labelledby="custom-tiles">
                      <h2 id="custom-tiles" className="eyebrow">
                        {item.tilesTitle || "Core Capabilities"}
                      </h2>
                      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {item.tiles.map((t, idx) => (
                          <li
                            key={t.label || idx}
                            className="flex items-start gap-3.5 rounded-xl border border-line bg-white p-4 shadow-sm transition hover:border-indigo/40"
                          >
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo-dark mt-0.5">
                              <Icon name={t.icon || "target"} className="h-5 w-5" />
                            </span>
                            <div>
                              <span className="font-display text-sm font-semibold text-ink block">{t.label}</span>
                              {t.description && (
                                <p className="mt-1 text-xs text-slate leading-relaxed">{t.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {item.steps && item.steps.length > 0 && (
                    <section aria-labelledby="custom-steps">
                      <h2 id="custom-steps" className="eyebrow">
                        {item.stepsTitle || "Execution Flow"}
                      </h2>
                      <ol className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {item.steps.map((s, idx) => (
                          <li
                            key={s.title || idx}
                            className="relative rounded-xl border border-line bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo/10 text-indigo-dark">
                                <Icon name={s.icon || "target"} className="h-4 w-4" />
                              </span>
                              <span className="font-mono text-xs font-semibold text-signal-dark">
                                {s.stage || `0${idx + 1}`}
                              </span>
                            </div>
                            <p className="mt-3 font-display text-sm font-semibold text-ink">{s.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate">{s.text || s.body}</p>
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}

                  {item.outcomeText && (
                    <div className="rounded-xl border border-l-4 border-line border-l-signal bg-paper-dim/60 p-5">
                      {item.outcomeTag && <p className="mono-tag text-signal-dark">{item.outcomeTag}</p>}
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/90 sm:text-[0.95rem]">{item.outcomeText}</p>
                    </div>
                  )}
                </div>
              )}

              {children}
            </div>
          </div>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
