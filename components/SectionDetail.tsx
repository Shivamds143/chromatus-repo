import Link from "next/link";
import Container from "./Container";
import CTABanner from "./CTABanner";
import SubpageBand from "./SubpageBand";
import type { Section, SubItem } from "@/lib/content";

export default function SectionDetail({
  section,
  item,
  children,
}: {
  section: Section;
  item: SubItem;
  children?: React.ReactNode;
}) {
  const otherItems = section.items.filter((i) => i.slug !== item.slug);

  return (
    <>
      <SubpageBand waveClass="text-paper-dim">
        <Link
          href={section.path}
          className="mono-tag inline-flex items-center gap-2 text-paper/60 transition hover:text-white"
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {section.eyebrow}
        </Link>
        <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-paper/75">{item.summary}</p>
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

        <Container className="relative grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
          <div className="rounded-2xl border border-line bg-white p-7 shadow-card sm:p-10">
            <span className="mb-6 block h-[3px] w-9 bg-signal" aria-hidden="true" />
            <div className="space-y-5">
              {item.body.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink/75 sm:text-[0.95rem]">
                  {para}
                </p>
              ))}
              {children}
            </div>
          </div>

          <aside className="self-start rounded-2xl bg-ink p-6 lg:sticky lg:top-24">
            <p className="eyebrow !text-signal-light">More in {section.eyebrow}</p>
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
          </aside>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
