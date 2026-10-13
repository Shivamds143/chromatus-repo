import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import CTABanner from "@/components/CTABanner";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { itemIconMap } from "@/lib/icons";
import { careersSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { careers as fallbackCareers } from "@/data/content/misc";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Careers & Open Positions — Chromatus Consulting",
  description: careersSection.intro,
};

const barColors = ["#1F82C5", "#EA9322", "#15619B", "#F2AC52", "#3D9FDE", "#C97614"];

export default async function CareersPage() {
  const content = await getPageContent("careers", fallbackCareers);

  return (
    <>
      <PageHero
        eyebrow={content?.eyebrow || careersSection.eyebrow}
        title={content?.title || careersSection.title}
        body={content?.lead || careersSection.intro}
      >
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/careers/open-positions"
            className="group inline-flex items-center gap-2 rounded-lg bg-[#8cc63f] hover:bg-[#7db934] active:scale-[0.98] px-7 py-3 text-sm font-semibold text-white shadow-xs transition duration-200"
          >
            Apply Now
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition group-hover:translate-x-0.5">
              <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </PageHero>

      {/* Careers Pillars & Culture: The 3 Core Cards */}
      <section className="py-20 border-t border-line/60 bg-white">
        <Container>
          <div className="mb-10">
            <p className="mono-tag text-indigo">Explore Opportunities</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Life & Opportunities at Chromatus
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {careersSection.items.map((item, i) => {
              const color = barColors[i % barColors.length];
              return (
                <Reveal key={item.slug} delay={i * 70}>
                  <Link
                    href={`${careersSection.path}/${item.slug}`}
                    className="group relative flex h-full flex-col justify-between gap-8 rounded-xl border border-line bg-white p-8 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{
                      borderTop: `3px solid ${color}`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${color}1A`, color }}
                      >
                        <Icon name={itemIconMap[item.slug] ?? "target"} className="h-5 w-5" />
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="mt-1 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color }}
                      >
                        <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate">{item.summary}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
