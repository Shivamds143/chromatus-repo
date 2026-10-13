import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Container from "@/components/Container";
import { getPageContent } from "@/lib/cms";
import { faq as fallbackFaq } from "@/data/content/misc";
import { listPublishedFaqs } from "@/lib/faqs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "FAQ — Chromatus Consulting" };

const fallbackFaqs = [
  {
    q: "What industries do you work across?",
    a: "Healthcare, Automotive & Transportation, Food & Beverages, Telecom & IT, Aerospace & Defense, Semiconductors & Electronics, Energy & Power, and Chemicals & Materials — the methodology adapts to the category, and we regularly work on cross-industry questions beyond these eight as well.",
  },
  {
    q: "How long does a typical study take?",
    a: "It depends on scope, but most concept tests and CSAT studies run four to eight weeks from kickoff to final report.",
  },
  {
    q: "What research methods do you use?",
    a: "A mix of primary research (surveys, interviews, field studies) and secondary research (market data, industry benchmarking, competitive intelligence), including CAPI, CATI, and CAWI methodologies depending on the study.",
  },
  {
    q: "Do you offer more than one-off studies?",
    a: "Yes — for CSR programs and long-term initiatives we run baseline and endline studies to measure impact against a clear starting point, alongside project-based research engagements.",
  },
];

export default async function FAQPage() {
  const content = await getPageContent("faq", fallbackFaq);
  const dbFaqs = await listPublishedFaqs();

  const displayFaqs = (dbFaqs && dbFaqs.length > 0)
    ? dbFaqs.map((f: any) => ({
        q: f.question,
        a: f.answer,
      }))
    : fallbackFaqs;

  return (
    <>
      <PageHero
        eyebrow={content?.eyebrow || "FAQ"}
        title={content?.title || "Common questions."}
        body={content?.body || "If you don't see your question here, it's usually faster to just ask us directly."}
      />
      <section className="py-24">
        <Container className="max-w-2xl divide-y divide-line">
          {displayFaqs.map((f: any) => (
            <div key={f.q} className="py-6">
              <h2 className="font-display text-lg font-semibold text-ink">{f.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">{f.a}</p>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
