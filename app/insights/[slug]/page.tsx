import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionDetail from "@/components/SectionDetail";
import InsightsVisuals from "@/components/InsightsVisuals";
import SubpageBand from "@/components/SubpageBand";
import Container from "@/components/Container";
import CTABanner from "@/components/CTABanner";
import { insightsSection } from "@/lib/content";
import { getArticles, getArticleBySlug } from "@/lib/insights";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export function generateStaticParams() {
  return insightsSection.items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const item = insightsSection.items.find((i) => i.slug === slug);
  if (item) {
    return { title: `${item.title} — Chromatus Consulting` };
  }
  const article = await getArticleBySlug(slug);
  if (article) {
    return { title: `${article.title} — Chromatus Insights` };
  }
  return { title: "Insights — Chromatus Consulting" };
}

export default async function InsightsSubPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const item = insightsSection.items.find((i) => i.slug === slug);

  if (item) {
    const articles = await getArticles({ type: slug });

    return (
      <SectionDetail section={insightsSection} item={item}>
        <InsightsVisuals slug={slug} />

        <div className="!mt-12 pt-8 border-t border-line/70 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-ink">
              {articles && articles.length > 0 ? "Featured Publications" : "Current Publications"}
            </h3>
            {articles && articles.length > 0 && (
              <span className="mono-tag text-indigo text-xs">
                {articles.length} {articles.length === 1 ? "release" : "releases"}
              </span>
            )}
          </div>

          {articles && articles.length > 0 ? (
            <div className="grid gap-4">
              {articles.map((art: any) => (
                <div
                  key={art.slug || art.id}
                  className="rounded-xl border border-line bg-white p-6 shadow-2xs transition hover:border-indigo/40 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 text-xs text-slate mb-2">
                    {art.tag && <span className="mono-tag text-indigo">{art.tag}</span>}
                    {art.published_at && (
                      <span>• {new Date(art.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    )}
                    {art.author && <span>• By {art.author}</span>}
                  </div>
                  <h4 className="font-display text-lg font-semibold text-ink">
                    <Link href={`/insights/${art.slug}`} className="hover:text-indigo transition">
                      {art.title}
                    </Link>
                  </h4>
                  {art.summary && (
                    <p className="mt-2 text-sm text-slate leading-relaxed">{art.summary}</p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/insights/${art.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo hover:text-indigo-dark transition"
                    >
                      Read full insight &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-paper-dim p-6 text-sm text-slate">
              <p>No publications are currently listed under this topic. Check back soon or visit our main <Link href="/insights" className="text-indigo font-semibold underline">Insights hub</Link>.</p>
            </div>
          )}
        </div>
      </SectionDetail>
    );
  }

  // Individual Article View rearranged with header illustration, left blue box, right white box
  const article = await getArticleBySlug(slug);
  if (!article) return notFound();

  return (
    <>
      <SubpageBand waveClass="text-paper-dim">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <Link
              href="/insights"
              className="mono-tag inline-flex items-center gap-2 text-paper/60 transition hover:text-white"
            >
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Insights &amp; Publications
            </Link>
            <div className="mt-4 flex items-center gap-3 text-xs text-paper/70">
              {article.tag && <span className="mono-tag !text-signal-light">{article.tag}</span>}
              {article.published_at && (
                <span>• {new Date(article.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              )}
              {article.author && <span>• By {article.author}</span>}
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
          </div>

          <div className="relative z-10 flex items-center justify-start lg:justify-end shrink-0">
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-3.5 shadow-2xl backdrop-blur transition hover:scale-[1.02]">
              <img
                src="/insights/overview.png"
                alt="Insights Hub"
                className="h-36 sm:h-44 w-auto max-w-[260px] sm:max-w-[320px] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      </SubpageBand>

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

        {/* Layout: Blue Information Box on LEFT, White Information Box on RIGHT */}
        <Container className="relative grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-12">
          {/* Left: Blue Information Box */}
          <aside className="self-start rounded-2xl bg-ink p-6 lg:sticky lg:top-24 order-2 lg:order-1 text-white shadow-card">
            <p className="eyebrow !text-signal-light">More in Insights</p>
            <ul className="mt-4">
              {insightsSection.items.map((cat) => (
                <li key={cat.slug} className="border-t border-paper/10">
                  <Link
                    href={`/insights/${cat.slug}`}
                    className="group flex items-center justify-between gap-4 py-3.5 text-sm text-paper/85 transition hover:text-white"
                  >
                    {cat.title}
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

            {/* Publication Details in Blue Box */}
            <div className="mt-8 rounded-xl bg-ink-soft/90 border border-white/10 p-4">
              <p className="mono-tag !text-signal-light text-[11px]">Publication Meta</p>
              <div className="mt-2 space-y-2 text-xs text-paper/80">
                {article.author && (
                  <div>
                    <span className="text-paper/50 block">Author</span>
                    <span className="font-semibold text-white">{article.author}</span>
                  </div>
                )}
                {article.published_at && (
                  <div>
                    <span className="text-paper/50 block">Published</span>
                    <span className="font-semibold text-white">
                      {new Date(article.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {article.tag && (
                  <div>
                    <span className="text-paper/50 block">Focus Area</span>
                    <span className="font-semibold text-white">{article.tag}</span>
                  </div>
                )}
              </div>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white underline underline-offset-4 hover:text-signal transition"
              >
                Request custom analysis &rarr;
              </Link>
            </div>
          </aside>

          {/* Right: Main White Information Box */}
          <div className="rounded-2xl border border-line bg-white p-7 shadow-card sm:p-10 order-1 lg:order-2">
            <span className="mb-6 block h-[3px] w-9 bg-signal" aria-hidden="true" />
            
            {article.summary && (
              <div className="mb-8 rounded-xl border border-line bg-bglight p-5 border-l-4 border-l-indigo">
                <p className="mono-tag text-indigo text-xs mb-1">Executive Summary</p>
                <p className="text-sm sm:text-base font-medium leading-relaxed text-ink/85">
                  {article.summary}
                </p>
              </div>
            )}

            {article.body && (
              <div className="prose prose-slate max-w-none text-base leading-relaxed text-slate whitespace-pre-line space-y-5">
                {article.body}
              </div>
            )}

            <div className="mt-10 border-t border-line/60 pt-6 flex items-center justify-between">
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo hover:text-indigo-dark transition"
              >
                &larr; Back to all insights
              </Link>
              <Link
                href="/contact"
                className="mono-tag text-xs text-signal hover:underline"
              >
                Discuss this research &rarr;
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
