import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import SubpageBand from "@/components/SubpageBand";
import PageHero from "@/components/PageHero";
import CTABanner from "@/components/CTABanner";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { aboutSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { leadershipTeam as fallbackLeadership } from "@/data/content/about";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Leadership Team — Chromatus Consulting",
};

const barColors = ["#1F82C5", "#EA9322", "#15619B", "#F2AC52", "#3D9FDE", "#C97614"];

const team = [
  {
    name: "Vijay Natekar",
    role: "Managing Director",
    icon: "target",
    bio: "15 years of experience in market research and business consulting. He has led engagements across product and concept testing, B2B research, and secondary research, and oversees project management, process design, and market engineering across Chromatus's client portfolio. His work centers on turning research into measurable value — from data analysis through to need-gap analysis for client strategy.",
    expertise: [
      "Market Research Leadership",
      "Product & Concept Testing",
      "B2B Research",
      "Secondary Research",
      "Project Management",
      "Process Design",
      "Market Engineering",
      "Need-Gap Analysis",
    ],
  },
  {
    name: "Ameya Dingare",
    role: "Client Engagement Head",
    icon: "handshake",
    bio: "13 years of experience in business intelligence and client engagement. He leads client management and is responsible for business and operational excellence across engagements, with strong expertise in market growth strategy, competitive intelligence, data analytics, and channel assessment.",
    expertise: [
      "Client Management",
      "Business Intelligence",
      "Market Growth Strategy",
      "Competitive Intelligence",
      "Data Analytics",
      "Channel Assessment",
      "Operational Excellence",
    ],
  },
  {
    name: "Gaurav Bhedasgaonkar",
    role: "Field Head",
    icon: "compass",
    bio: "12 years of experience in the market research industry, specialising in large-scale field operations, including government surveys. He oversees data validation, product and company mapping, and end-to-end project management for B2C survey execution.",
    expertise: [
      "Field Operations",
      "Government Surveys",
      "Data Validation",
      "Product & Company Mapping",
      "B2C Surveys",
      "Project Management",
      "Field Execution",
    ],
  },
  {
    name: "Rahul Nawale",
    role: "Research Head",
    icon: "document",
    bio: "8 years of experience across manufacturing and market research. He specialises in B2B and B2C customer satisfaction (CSAT) surveys, with additional expertise in operations management, supply chain research, data evaluation, and competitive intelligence.",
    expertise: [
      "B2B & B2C CSAT Surveys",
      "Operations Management",
      "Supply Chain Research",
      "Data Evaluation",
      "Competitive Intelligence",
      "Market Research",
    ],
  },
  {
    name: "Aboli Joshi",
    role: "Senior Data Analyst",
    icon: "chart-bar",
    bio: "14 years of experience spanning R&D, patent analysis, and market research. Her expertise covers B2B and secondary research, data analysis, technology gap assessment, and patent intelligence. She also brings German language expertise, supporting research and analysis involving German-speaking markets and sources.",
    expertise: [
      "B2B Research",
      "Secondary Research",
      "Data Analysis",
      "Technology Gap Assessment",
      "Patent Analysis",
      "German Language Expertise",
    ],
  },
  {
    name: "Sanika Mahajan",
    role: "Data Scientist",
    icon: "chip",
    bio: "3 years of experience in data analysis and field research, with hands-on expertise in primary research, large-scale data handling, and statistical analysis. She works across primary and secondary research, supporting data-driven insights and strategic business and marketing decisions.",
    expertise: [
      "Primary Research",
      "Data Analysis",
      "Statistical Tools",
      "Secondary Research",
      "Field Coordination",
      "Dataset Management",
    ],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function LeadershipTeamPage() {
  const content = await getPageContent("leadershipTeam", fallbackLeadership);
  const otherItems = aboutSection.items.filter((i) => i.slug !== "leadership-team");

  const displayTeam =
    content?.members && content.members.length > 0
      ? content.members.map((m: any) => ({
          name: m.name,
          role: m.role,
          photo: m.photo || m.profile_photo || m.image || "",
          linkedin: m.linkedin || m.linkedin_url || "",
          icon: m.icon || "target",
          bio: m.bio,
          expertise: Array.isArray(m.expertise)
            ? m.expertise
            : typeof m.expertise === "string"
            ? m.expertise.split(",").map((s: string) => s.trim())
            : [],
        }))
      : team;

  const rawEyebrow = content?.eyebrow || "About Us";
  const cleanEyebrow = rawEyebrow.replace(/^[0-9]{1,2}\s*[\/—–-]\s*/, "").replace(/^.*?\/\s*/, "").trim() || "About Us";
  const title = content?.title || "Leadership Team";
  const lead =
    content?.lead ||
    "The people leading research design, client engagement, and delivery across Chromatus.";

  return (
    <>
      <SubpageBand waveClass="text-paper-dim">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <Link
              href="/about"
              className="mono-tag inline-flex items-center gap-2 text-paper/60 transition hover:text-white"
            >
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cleanEyebrow}
            </Link>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-paper/75">{lead}</p>
          </div>

          <div className="relative z-10 flex items-center justify-start lg:justify-end shrink-0">
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-3.5 shadow-2xl backdrop-blur transition hover:scale-[1.02]">
              <img
                src="/about/leadership-team.png"
                alt="Leadership Team"
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
            <p className="eyebrow !text-signal-light">More in About Us</p>
            <ul className="mt-4">
              {otherItems.map((other) => (
                <li key={other.slug} className="border-t border-paper/10">
                  <Link
                    href={`${aboutSection.path}/${other.slug}`}
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

            {/* Quick Advisory CTA */}
            <div className="mt-8 rounded-xl bg-ink-soft/90 border border-white/10 p-4">
              <p className="mono-tag !text-signal-light text-[11px]">Direct Engagement</p>
              <p className="mt-1.5 text-xs text-paper/80 leading-relaxed">
                Connect directly with our practice leaders to discuss scoping, methodology, and execution.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white underline underline-offset-4 hover:text-signal transition"
              >
                Schedule discussion &rarr;
              </Link>
            </div>
          </aside>

          {/* Right: Main White Information Box */}
          <div className="rounded-2xl border border-line bg-white p-7 shadow-card sm:p-10 order-1 lg:order-2">
            <span className="mb-6 block h-[3px] w-9 bg-signal" aria-hidden="true" />
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Research Directors &amp; Domain Specialists
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/75 sm:text-[0.95rem]">
              Our leadership brings together decades of quantitative market research, primary field operations,
              and strategic advisory experience across industrial, commercial, and public sectors.
            </p>

            {/* Team Grid inside the white box */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {displayTeam.map((person: any, i: number) => {
                const color = barColors[i % barColors.length];
                return (
                  <Reveal key={person.name} delay={i * 60}>
                    <div
                      className="flex h-full flex-col justify-between rounded-xl border border-line bg-white p-6 shadow-sm transition hover:shadow-md"
                      style={{ borderTop: `3px solid ${color}` }}
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          {person.linkedin ? (
                            <a
                              href={person.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`View ${person.name}'s LinkedIn profile`}
                              className="group/avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-indigo transition"
                              style={{ backgroundColor: color }}
                            >
                              {person.photo ? (
                                <img
                                  src={person.photo}
                                  alt={person.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initials(person.name)
                              )}
                            </a>
                          ) : (
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white overflow-hidden"
                              style={{ backgroundColor: color }}
                            >
                              {person.photo ? (
                                <img
                                  src={person.photo}
                                  alt={person.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initials(person.name)
                              )}
                            </span>
                          )}
                          <div>
                            <h3 className="font-display text-base font-semibold text-ink">
                              {person.name}
                            </h3>
                            <p
                              className="mt-0.5 flex items-center gap-1.5 text-xs font-medium"
                              style={{ color }}
                            >
                              <Icon name={person.icon} className="h-3.5 w-3.5" />
                              {person.role}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3.5 text-xs leading-relaxed text-slate sm:text-[13px]">
                          {person.bio}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1 border-t border-line/60 pt-3">
                        {person.expertise.map((tag: string) => (
                          <span
                            key={tag}
                            className="mono-tag rounded-md border border-line bg-bglight px-2 py-0.5 text-[10px] text-slate"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Wider Team Callout Box */}
            <div className="mt-10 rounded-xl border border-line bg-paper-dim/80 p-6 sm:p-8">
              <p className="eyebrow"><span className="text-signal-dark">+</span> The wider delivery team</p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Beyond our core leadership, Chromatus fields a team of{" "}
                <span className="font-semibold text-ink">20 dedicated researchers</span> and
                over <span className="font-semibold text-ink">60+ experienced field investigators</span>{" "}
                across India, supported by academic specialists in marketing, management,
                statistics, operations research, rural development, and social research. This
                gives us the depth to run everything from a focused customer satisfaction study
                to a nationwide field survey.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
