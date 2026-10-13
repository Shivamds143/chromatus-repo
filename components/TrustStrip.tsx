import Link from "next/link";
import Container from "./Container";
import Icon from "./Icon";
import { itemIconMap } from "@/lib/icons";

const industries = [
  { name: "Healthcare", slug: "healthcare" },
  { name: "Automotive & Transportation", slug: "automotive-transportation" },
  { name: "Food & Beverages", slug: "food-beverages" },
  { name: "Telecom & IT", slug: "telecom-it" },
  { name: "Aerospace & Defense", slug: "aerospace-defense" },
  { name: "Semiconductors & Electronics", slug: "semiconductors-electronics" },
  { name: "Energy & Power", slug: "energy-power" },
  { name: "Chemicals & Materials", slug: "chemicals-materials" },
];

// One full set of pills. The marquee renders this twice; the second copy is
// hidden from assistive tech and the tab order so keyboard and screen-reader
// users only meet each industry once. Each pill carries its own right margin
// (instead of a flex gap) so the -50% loop lands exactly on the second copy.
function IndustryList({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className={`flex shrink-0 items-center ${duplicate ? "motion-reduce:hidden" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      {industries.map(({ name, slug }) => (
        <li key={slug} className="mr-3">
          <Link
            href={`/industries/${slug}`}
            tabIndex={duplicate ? -1 : undefined}
            className="group flex items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-white px-4 py-2.5 font-display text-[15px] font-medium text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo hover:text-indigo-dark hover:shadow-md"
          >
            <Icon
              name={itemIconMap[slug] ?? "target"}
              className="h-[18px] w-[18px] text-indigo transition-colors group-hover:text-signal-dark"
            />
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function TrustStrip() {
  return (
    <div className="border-b border-line bg-paper-dim py-5">
      <Container>
        <p className="eyebrow mb-3"><span className="text-signal-dark">01 /</span> Trusted by teams across</p>
      </Container>
      <div className="overflow-hidden py-2 motion-reduce:overflow-x-auto">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          <IndustryList />
          <IndustryList duplicate />
        </div>
      </div>
    </div>
  );
}
