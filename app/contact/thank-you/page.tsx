import type { Metadata } from "next";
import Link from "next/link";
import SubpageBand from "@/components/SubpageBand";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CTABanner from "@/components/CTABanner";
import { getPageContent } from "@/lib/cms";
import { contactThankYou as defaultContent } from "@/data/content/misc";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("contactThankYou", defaultContent);
  return {
    title: `${content.title || "Thank You for Contacting Us"} — Chromatus Consulting`,
    description:
      content.cardDescription ||
      content.lead ||
      "We have received your inquiry. A Chromatus Consulting research specialist will follow up with you within one business day.",
  };
}

export default async function ContactThankYouPage() {
  const content = await getPageContent("contactThankYou", defaultContent);

  const steps = Array.isArray(content.steps) && content.steps.length > 0 ? content.steps : defaultContent.steps;

  return (
    <>
      <SubpageBand waveClass="text-paper-dim">
        <Link
          href="/contact"
          className="mono-tag inline-flex items-center gap-2 text-paper/60 transition hover:text-white"
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M11 5H1M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Contact
        </Link>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-signal-light">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{content.eyebrow || "INQUIRY CONFIRMED"}</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {content.title || "Thank You for Reaching Out"}
        </h1>
        {content.lead && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper/75 sm:text-base">
            {content.lead}
          </p>
        )}
      </SubpageBand>

      <section className="relative overflow-clip bg-paper-dim py-14 sm:py-20">
        <Container className="max-w-4xl">
          <Reveal>
            <div className="relative rounded-2xl border border-line bg-white p-7 sm:p-12 shadow-card">
              {/* Success Checkmark Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-8 border-b border-line">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <span className="mono-tag text-emerald-700 text-xs font-semibold">
                    {content.cardEyebrow || "Message Successfully Received"}
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {content.cardTitle || "We've Got Your Request"}
                  </h2>
                  {content.cardDescription && (
                    <p className="mt-1 text-sm text-slate">
                      {content.cardDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Next Steps Process */}
              {steps && steps.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    {content.stepsHeading || "What Happens Next"}
                  </p>
                  <div className={`grid gap-4 sm:grid-cols-${Math.min(steps.length, 3)}`}>
                    {steps.map((st: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-line bg-bglight/60 p-5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo/10 text-indigo font-bold text-xs mb-3">
                          {st.step || idx + 1}
                        </div>
                        <h3 className="font-display text-sm font-bold text-ink">{st.title}</h3>
                        <p className="mt-1 text-xs text-slate leading-relaxed">
                          {st.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Assistance Box */}
              {(content.supportBoxTitle || content.supportPhone || content.supportEmail) && (
                <div className="mt-8 rounded-xl border border-line bg-paper-dim/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/75">
                      {content.supportBoxTitle || "Need immediate assistance?"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate">
                      {content.supportNote || "Contact our Pune headquarters directly: "}{" "}
                      {content.supportPhone && (
                        <a href={`tel:${content.supportPhone}`} className="font-semibold text-ink hover:text-indigo">
                          {content.supportPhone}
                        </a>
                      )}
                      {content.supportPhone && content.supportEmail && <span> or </span>}
                      {content.supportEmail && (
                        <a href={`mailto:${content.supportEmail}`} className="font-semibold text-indigo underline underline-offset-2">
                          {content.supportEmail}
                        </a>
                      )}
                    </p>
                  </div>
                  {content.supportHours && (
                    <div className="shrink-0 text-xs text-slate font-mono bg-white px-3 py-1.5 rounded-md border border-line">
                      {content.supportHours}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-10 pt-8 border-t border-line flex flex-wrap items-center gap-3">
                {content.primaryButtonText && (
                  <Link
                    href={content.primaryButtonHref || "/services"}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-light active:scale-[0.98]"
                  >
                    <span>{content.primaryButtonText}</span>
                    <span>&rarr;</span>
                  </Link>
                )}
                {content.secondaryButtonText && (
                  <Link
                    href={content.secondaryButtonHref || "/insights"}
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-ink shadow-2xs transition hover:bg-paper-dim hover:border-slate-300"
                  >
                    <span>{content.secondaryButtonText}</span>
                  </Link>
                )}
                <Link
                  href={content.homeButtonHref || "/"}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-ink px-3 py-2 transition sm:ml-auto"
                >
                  <span>&larr; {content.homeButtonText || "Return to Homepage"}</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
