import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
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
          icon: m.icon || "target",
          bio: m.bio,
          expertise: Array.isArray(m.expertise)
            ? m.expertise
            : typeof m.expertise === "string"
            ? m.expertise.split(",").map((s: string) => s.trim())
            : [],
        }))
      : team;

  return (
    <>
      <PageHero
        eyebrow={content?.eyebrow || "About Us"}
        title={content?.title || "Leadership Team"}
        body={content?.lead || "The people leading research design, client engagement, and delivery across Chromatus."}
      />

      <section className="py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayTeam.map((person: any, i: number) => {
              const color = barColors[i % barColors.length];
              return (
                <Reveal key={person.name} delay={i * 70}>
                  <div
                    className="flex h-full flex-col rounded-xl border border-line bg-white p-7 shadow-sm"
                    style={{ borderTop: `3px solid ${color}` }}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {initials(person.name)}
                      </span>
                      <div>
                        <h2 className="font-display text-base font-semibold text-ink">
                          {person.name}
                        </h2>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
                          <Icon name={person.icon} className="h-3.5 w-3.5" />
                          {person.role}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 flex-1 text-sm leading-relaxed text-slate">
                      {person.bio}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">
                      {person.expertise.map((tag: string) => (
                        <span
                          key={tag}
                          className="mono-tag rounded-full border border-line px-2.5 py-1 text-slate"
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

          <Reveal delay={team.length * 70}>
            <div className="mt-10 rounded-xl border border-line bg-paper-dim p-8">
              <p className="eyebrow"><span className="text-signal-dark">+</span> The wider team</p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate">
                Beyond our core leadership, Chromatus fields a team of{" "}
                <span className="font-semibold text-ink">20 dedicated researchers</span> and
                over <span className="font-semibold text-ink">60+ experienced field investigators</span>{" "}
                across India, supported by academic specialists in marketing, management,
                statistics, operations research, rural development, and social research. This
                gives us the depth to run everything from a focused customer satisfaction study
                to a nationwide field survey.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 border-t border-line pt-8">
            <p className="eyebrow">More in About Us</p>
            <ul className="mt-5 grid gap-x-8 sm:grid-cols-3">
              {otherItems.map((other) => (
                <li key={other.slug} className="border-b border-line">
                  <Link
                    href={`${aboutSection.path}/${other.slug}`}
                    className="flex items-center justify-between gap-4 py-3.5 text-sm text-ink/75 transition hover:text-ink"
                  >
                    {other.title}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 text-slate">
                      <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
