import type { Metadata } from "next";
import SectionHub from "@/components/SectionHub";
import { aboutSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { aboutOverview } from "@/data/content/about";

import { buildSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata("/about", {
    title: "About Us — Chromatus Consulting",
    description: aboutSection.intro,
  });
}

export default async function AboutPage() {
  const content = await getPageContent("aboutOverview", aboutOverview);

  return (
    <SectionHub
      section={aboutSection}
      overrideEyebrow={content?.eyebrow}
      overrideTitle={content?.title}
      overrideIntro={content?.lead}
      overrideImage={content?.image || content?.photo || undefined}
    >
      {(content?.body || (content?.stats && content.stats.length > 0) || content?.feature) && (
        <div className="mb-16 space-y-8">
          {content?.body && (
            <div className="rounded-2xl border border-line bg-white p-7 shadow-card sm:p-10">
              <span className="mb-4 block h-[3px] w-9 bg-signal" aria-hidden="true" />
              <p className="text-base leading-relaxed text-slate sm:text-lg">
                {content.body}
              </p>
            </div>
          )}

          {content?.stats && content.stats.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {content.stats.map((s: any, idx: number) => (
                <div
                  key={s.label || idx}
                  className="rounded-xl border border-line bg-white p-6 shadow-sm transition hover:border-signal/40"
                >
                  <div className="font-display text-3xl font-bold text-signal sm:text-4xl">
                    {s.value}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-ink leading-relaxed">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {content?.feature?.title && (
            <div className="rounded-xl border border-l-4 border-line border-l-signal bg-paper-dim/60 p-6">
              <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                {content.feature.title}
              </h3>
              {content.feature.body && (
                <p className="mt-2 text-sm leading-relaxed text-slate sm:text-[0.95rem]">
                  {content.feature.body}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </SectionHub>
  );
}
