import type { Metadata } from "next";
import Link from "next/link";
import SectionHub from "@/components/SectionHub";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { insightsSection } from "@/lib/content";
import { getArticles } from "@/lib/insights";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Insights — Chromatus Consulting",
  description: insightsSection.intro,
};

export default async function InsightsPage() {
  const articles = await getArticles();

  return (
    <>
      <SectionHub section={insightsSection} />

      {articles && articles.length > 0 && (
        <section className="py-20 border-t border-line bg-paper-dim/50">
          <Container>
            <div className="mb-10">
              <p className="mono-tag text-indigo">Recent Thinking</p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Published Reports &amp; Articles
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((art: any, i: number) => (
                <Reveal key={art.slug || art.id} delay={i * 60}>
                  <div className="flex h-full flex-col justify-between rounded-xl border border-line bg-white p-7 shadow-2xs transition hover:-translate-y-1 hover:border-indigo/40 hover:shadow-md">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate mb-3">
                        {art.tag && <span className="mono-tag text-indigo">{art.tag}</span>}
                        {art.published_at && (
                          <span>• {new Date(art.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-semibold text-ink">
                        <Link href={`/insights/${art.slug}`} className="hover:text-indigo transition">
                          {art.title}
                        </Link>
                      </h3>
                      {art.summary && (
                        <p className="mt-2.5 text-sm text-slate leading-relaxed line-clamp-3">
                          {art.summary}
                        </p>
                      )}
                    </div>
                    <div className="mt-6 border-t border-line/60 pt-4">
                      <Link
                        href={`/insights/${art.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo hover:text-indigo-dark transition"
                      >
                        Read publication &rarr;
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
