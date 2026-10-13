import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionDetail from "@/components/SectionDetail";
import SubpageBand from "@/components/SubpageBand";
import CareerApplicationForm from "@/components/CareerApplicationForm";
import CareerWorkflow from "@/components/CareerWorkflow";
import Container from "@/components/Container";
import CTABanner from "@/components/CTABanner";
import { careersSection } from "@/lib/content";
import { getOpenRoles, getPublishedJobBySlug } from "@/lib/jobs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export function generateStaticParams() {
  return careersSection.items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const item = careersSection.items.find((i) => i.slug === slug);
  if (item) {
    return { title: `${item.title} — Chromatus Consulting` };
  }
  const job = await getPublishedJobBySlug(slug);
  if (job) {
    return { title: `${job.title} — Careers at Chromatus` };
  }
  return { title: "Careers — Chromatus Consulting" };
}

export default async function CareersSubPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const item = careersSection.items.find((i) => i.slug === slug);

  if (item) {
    let openRoles: any[] = [];
    if (slug === "open-positions") {
      const openRoles = await getOpenRoles();
      return (
        <>
          <SubpageBand waveClass="text-[#f4f9f0]">
            <Link
              href="/careers"
              className="mono-tag inline-flex items-center gap-2 text-paper/60 transition hover:text-white"
            >
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Careers
            </Link>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {item.title}
            </h1>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-paper/75">{item.summary}</p>
          </SubpageBand>

          <CareerWorkflow roles={openRoles} />

          <CTABanner />
        </>
      );
    }

    return (
      <SectionDetail section={careersSection} item={item}>
        <div className="pt-8">
          <CareerApplicationForm initialPosition="General / Open Application" />
        </div>
      </SectionDetail>
    );
  }

  // Check if it's an individual job slug
  const job = await getPublishedJobBySlug(slug);
  if (!job) return notFound();

  return (
    <>
      <SubpageBand>
        <Link
          href="/careers/open-positions"
          className="mono-tag inline-flex items-center gap-2 text-paper/60 transition hover:text-white"
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Open Positions
        </Link>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          {job.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-paper/70">
          {job.department && <span className="mono-tag text-signal-light">{job.department}</span>}
          {job.location && <span>• {job.location}</span>}
          {job.job_type && <span>• {job.job_type}</span>}
          {job.experience_level && <span>• {job.experience_level}</span>}
        </div>
      </SubpageBand>

      <section className="py-20">
        <Container className="grid gap-16 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            {job.summary && (
              <p className="text-base font-medium leading-relaxed text-ink/80">{job.summary}</p>
            )}
            {job.description && (
              <div className="prose text-sm leading-relaxed text-slate whitespace-pre-line">
                {job.description}
              </div>
            )}
            {job.responsibilities && (
              <div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">Key Responsibilities</h3>
                <div className="text-sm leading-relaxed text-slate whitespace-pre-line">
                  {job.responsibilities}
                </div>
              </div>
            )}
            {job.requirements && (
              <div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">Requirements & Qualifications</h3>
                <div className="text-sm leading-relaxed text-slate whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="sticky top-28 rounded-2xl border border-line bg-white p-6 shadow-xs">
              <h3 className="font-display text-lg font-semibold text-ink mb-4">Apply for this position</h3>
              <CareerApplicationForm initialPosition={job.title} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
