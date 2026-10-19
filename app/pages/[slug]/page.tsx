import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import CTABanner from "@/components/CTABanner";
import Testimonials from "@/components/Testimonials";
import { getCustomPageBySlug } from "@/lib/customPages";
import { listPublishedTestimonials } from "@/lib/testimonials";
import { listPublishedFaqs } from "@/lib/faqs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

import { buildSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const page: any = await getCustomPageBySlug(slug, { pageType: "custom" });
  const fallback = page
    ? {
        title: `${page.title} — Chromatus Consulting`,
        description: page.meta_description || "",
      }
    : { title: "Chromatus Consulting" };
  return buildSeoMetadata(`/pages/${slug}`, fallback);
}

export default async function CustomPageView({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const page: any = await getCustomPageBySlug(slug, { pageType: "custom" });
  if (!page) return notFound();

  const testimonials = await listPublishedTestimonials();
  const faqs = await listPublishedFaqs();

  return (
    <>
      <PageHero
        eyebrow="Overview"
        title={page.title}
        body={page.meta_description || ""}
        imageSrc={page.image || undefined}
      />

      <div className="space-y-16 py-12">
        {(page.sections || []).map((sec: any, idx: number) => {
          const d = sec.data || {};
          const type = sec.type || sec.section_type;

          switch (type) {
            case "hero":
              return (
                <div key={idx} className="bg-paper-dim py-12">
                  <Container>
                    {d.eyebrow && (
                      <p
                        className="mono-tag"
                        style={{ color: d.eyebrowColor || "var(--color-eyebrow, #1F82C5)" }}
                      >
                        {d.eyebrow}
                      </p>
                    )}
                    {d.title && <h2 className="mt-2 font-display text-3xl font-bold text-ink">{d.title}</h2>}
                    {d.lead && <p className="mt-4 text-base leading-relaxed text-slate">{d.lead}</p>}
                    {d.image && (
                      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white p-3">
                        <img src={d.image} alt={d.title || ""} className="max-h-80 w-full object-contain rounded-lg" />
                      </div>
                    )}
                  </Container>
                </div>
              );

            case "richtext":
              return (
                <Container key={idx} className="max-w-3xl">
                  {d.heading && <h2 className="font-display text-2xl font-bold text-ink mb-4">{d.heading}</h2>}
                  {d.body && <div className="prose text-base leading-relaxed text-slate whitespace-pre-line">{d.body}</div>}
                </Container>
              );

            case "cards":
              return (
                <Container key={idx}>
                  {d.heading && <h2 className="font-display text-2xl font-bold text-ink mb-8">{d.heading}</h2>}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(d.items || []).map((item: any, i: number) => (
                      <div key={i} className="rounded-xl border border-line bg-white p-6 shadow-2xs">
                        <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </Container>
              );

            case "stats":
              return (
                <div key={idx} className="border-y border-line bg-paper-dim py-12">
                  <Container className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                    {(d.items || []).map((s: any, i: number) => (
                      <div key={i} className="text-center">
                        <p className="font-display text-3xl font-bold text-indigo">{s.value}</p>
                        <p className="mt-1 text-xs text-slate">{s.label}</p>
                      </div>
                    ))}
                  </Container>
                </div>
              );

            case "image_text":
              return (
                <Container key={idx} className="grid gap-8 sm:grid-cols-2 items-center">
                  <div>
                    {d.heading && <h2 className="font-display text-2xl font-bold text-ink mb-4">{d.heading}</h2>}
                    {d.body && <p className="text-base text-slate leading-relaxed">{d.body}</p>}
                  </div>
                  {d.image && (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.image} alt={d.imageAlt || d.heading || ""} className="rounded-xl border border-line object-cover" />
                    </div>
                  )}
                </Container>
              );

            case "cta":
              return (
                <CTABanner
                  key={idx}
                  content={{
                    title: d.heading,
                    cta: { label: d.buttonLabel, href: d.buttonHref },
                  }}
                />
              );

            case "testimonials":
              return <Testimonials key={idx} items={testimonials as any} />;

            case "faq":
              return (
                <Container key={idx} className="max-w-2xl divide-y divide-line">
                  {faqs.map((f: any) => (
                    <div key={f.id || f.question} className="py-6">
                      <h3 className="font-display text-lg font-semibold text-ink">{f.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate">{f.answer}</p>
                    </div>
                  ))}
                </Container>
              );

            default:
              return null;
          }
        })}
      </div>
    </>
  );
}
