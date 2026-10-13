import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";
import Icon from "./Icon";
import { pageIconMap } from "@/lib/icons";
import { aboutSection, servicesSection, industriesSection, insightsSection, careersSection } from "@/lib/content";

const primaryPages = [
  { ...aboutSection, blurb: "Our story, leadership team, expertise, and how we approach research." },
  { ...servicesSection, blurb: "Nine research and consulting services, from consumer behaviour to government surveys." },
  { ...industriesSection, blurb: "Eight core industry verticals, and the questions we help each one answer." },
  { ...insightsSection, blurb: "Research reports, articles, whitepapers, and case studies from our work." },
  { ...careersSection, blurb: "Who we look for, our culture, and current openings." },
  {
    key: "contact",
    path: "/contact",
    eyebrow: "Contact Us",
    blurb: "Get in touch, locations, and contact details.",
  },
];

const barColors = ["#1F82C5", "#EA9322", "#15619B", "#F2AC52", "#3D9FDE", "#C97614"];

export default function ExploreGrid() {
  return (
    <section className="bg-paper py-24">
      <Container>
        <p className="eyebrow"><span className="text-signal-dark">02 /</span> Find your way around</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem]">
          Everything Chromatus does, in six places.
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {primaryPages.map((p, i) => {
            const color = barColors[i % barColors.length];
            return (
              <Reveal key={p.key} delay={i * 70}>
                <Link
                  href={p.path}
                  className="group relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-xl border border-line bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_var(--glow)]"
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
                      <Icon name={pageIconMap[p.key] ?? "target"} className="h-5 w-5" />
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
                    <h3 className="font-display text-lg font-semibold text-ink">{p.eyebrow}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
