import Link from "next/link";
import Container from "./Container";
import PageHero from "./PageHero";
import CTABanner from "./CTABanner";
import Reveal from "./Reveal";
import Icon from "./Icon";
import { itemIconMap } from "@/lib/icons";
import type { Section } from "@/lib/content";

const barColors = ["#1F82C5", "#EA9322", "#15619B", "#F2AC52", "#3D9FDE", "#C97614"];

export default function SectionHub({
  section,
  overrideTitle,
  overrideIntro,
  overrideEyebrow,
}: {
  section: Section;
  overrideTitle?: string;
  overrideIntro?: string;
  overrideEyebrow?: string;
}) {
  return (
    <>
      <PageHero
        eyebrow={overrideEyebrow || section.eyebrow}
        title={overrideTitle || section.title}
        body={overrideIntro || section.intro}
      />

      <section className="py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item, i) => {
              const color = barColors[i % barColors.length];
              return (
                <Reveal key={item.slug} delay={i * 70}>
                  <Link
                    href={`${section.path}/${item.slug}`}
                    className="group relative flex h-full flex-col justify-between gap-8 rounded-xl border border-line bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_var(--glow)]"
                    style={{
                      borderTop: `3px solid ${color}`,
                      ["--glow" as string]: `${color}66`,
                    } as any}
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
                      <h2 className="font-display text-lg font-semibold text-ink">{item.title}</h2>
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
