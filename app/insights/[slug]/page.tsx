import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionDetail from "@/components/SectionDetail";
import Container from "@/components/Container";
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
        <div className="pt-6 space-y-6">
          <h3 className="font-display text-xl font-semibold text-ink">
            {articles && articles.length > 0 ? "Latest Publications" : ""}
          </h3>
          {articles && articles.length > 0 ? (
            <div className="grid gap-4">
              {articles.map((art: any) => (
                <div
                  key={art.slug || art.id}
                  className="rounded-xl border border-line bg-white p-6 shadow-2xs transition hover:border-indigo/40"
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

  // Check if it's an individual article
  const article = await getArticleBySlug(slug);
  if (!article) return notFound();

  return (
    <>
      <section className="border-b border-line bg-paper-dim py-20">
        <Container>
          <Link
            href="/insights"
            className="mono-tag inline-flex items-center gap-2 text-slate transition hover:text-ink"
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Insights
          </Link>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate">
            {article.tag && <span className="mono-tag text-indigo">{article.tag}</span>}
            {article.published_at && (
              <span>• {new Date(article.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            )}
            {article.author && <span>• By {article.author}</span>}
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl text-ink">
            {article.title}
          </h1>
        </Container>
      </section>

      <section className="py-20">
        <Container className="max-w-3xl">
          {article.summary && (
            <p className="text-lg font-medium leading-relaxed text-ink/80 mb-8 border-l-4 border-indigo pl-4">
              {article.summary}
            </p>
          )}
          {article.body && (
            <div className="prose prose-slate max-w-none text-base leading-relaxed text-slate whitespace-pre-line space-y-4">
              {article.body}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
