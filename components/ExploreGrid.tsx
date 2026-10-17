import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";
import Icon from "./Icon";
import { itemIconMap } from "@/lib/icons";
import { servicesSection } from "@/lib/content";

import type { LiveServicesData } from "@/lib/services";

const barColors = ["#1F82C5", "#EA9322", "#15619B", "#F2AC52", "#3D9FDE", "#C97614"];

export default function ExploreGrid({ servicesData }: { servicesData?: LiveServicesData }) {
  const eyebrow = servicesData?.eyebrow || "Services & Capabilities";
  const title = servicesData?.title || servicesSection.title;
  const intro = servicesData?.intro || servicesSection.intro;
  const items = servicesData?.items && servicesData.items.length > 0
    ? servicesData.items
    : servicesSection.items;

  return (
    <section className="bg-paper py-24">
      <Container>
        <p
          className="eyebrow"
          style={(servicesData as any)?.eyebrowColor ? { color: (servicesData as any).eyebrowColor } : undefined}
        >
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem]">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-slate leading-relaxed">
          {intro}
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, i: number) => {
            const color = item.color || barColors[i % barColors.length];
            const href = item.href || `${servicesSection.path}/${item.slug}`;
            const iconName = item.icon || (itemIconMap[item.slug] ?? "target");
            return (
              <Reveal key={item.slug || i} delay={i * 70}>
                <Link
                  href={href}
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
                      <Icon name={iconName} className="h-5 w-5" />
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
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.summary}</p>
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
