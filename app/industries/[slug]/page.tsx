import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SectionDetail from "@/components/SectionDetail";
import { industriesSection, type Section } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { getDefaultForKey } from "@/lib/cmsDefaults";
import { getCustomPageBySlug, listPublishedCustomPages } from "@/lib/customPages";
import { getLiveIndustriesData, INDUSTRY_SLUG_TO_CMS_KEY } from "@/lib/industries";
import { isPreviewActive } from "@/lib/preview";
import { listPublishedFaqs } from "@/lib/faqs";
import { getIndustriesEnabled } from "@/lib/settings";


export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateStaticParams() {
  const publishedCustom = await listPublishedCustomPages("industry").catch(() => []);
  return [
    ...industriesSection.items.map((item) => ({ slug: item.slug })),
    { slug: "beyond-these-eight" },
    ...publishedCustom.map((item: any) => ({ slug: item.slug })),
  ];
}

import { buildSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const enabled = await getIndustriesEnabled();
  if (!enabled) return { title: "Not Found" };
  const { slug } = await Promise.resolve(params);
  const preview = await isPreviewActive();
  const item = industriesSection.items.find((i) => i.slug === slug);
  const cmsKey = INDUSTRY_SLUG_TO_CMS_KEY[slug];

  let fallback: { title?: string; description?: string } = { title: "Chromatus Consulting" };
  if (item || cmsKey) {
    if (cmsKey) {
      const fb = getDefaultForKey(cmsKey);
      const cmsData = await getPageContent(cmsKey, fb);
      if (cmsData?.title) {
        fallback = {
          title: `${cmsData.title} — Chromatus Consulting`,
          description: cmsData.lead || item?.summary || "",
        };
      } else if (item) {
        fallback = { title: `${item.title} — Chromatus Consulting`, description: item.summary };
      }
    } else if (item) {
      fallback = { title: `${item.title} — Chromatus Consulting`, description: item.summary };
    }
  } else {
    const customPage: any = await getCustomPageBySlug(slug, { preview, pageType: "industry" });
    if (customPage) {
      fallback = {
        title: `${customPage.title} — Chromatus Consulting`,
        description: customPage.meta_description || "",
      };
    }
  }
  return buildSeoMetadata(`/industries/${slug}`, fallback);
}

export default async function IndustriesSubPage({ params }: Props) {
  const enabled = await getIndustriesEnabled();
  if (!enabled) return notFound();

  const { slug } = await Promise.resolve(params);
  const preview = await isPreviewActive();
  const industriesData = await getLiveIndustriesData();

  const liveSection: Section = {
    key: "industries",
    path: "/industries",
    eyebrow: industriesData.eyebrow,
    title: industriesData.title,
    intro: industriesData.intro,
    items: industriesData.items.map((it) => ({
      slug: it.slug,
      title: it.title,
      summary: it.summary,
      body: [],
    })),
  };

  let item = industriesSection.items.find((i) => i.slug === slug);
  const cmsKey = INDUSTRY_SLUG_TO_CMS_KEY[slug];

  if (item || cmsKey) {
    let finalTitle = item?.title || "Industry Specialization";
    let finalSummary = item?.summary || "";
    let finalBody: string[] = item?.body || [];

    let extraProps: any = {};
    if (cmsKey) {
      const fallback = getDefaultForKey(cmsKey);
      const cmsData = await getPageContent(cmsKey, fallback);
      if (cmsData) {
        finalTitle = cmsData.title || finalTitle;
        finalSummary = cmsData.lead || finalSummary;
        if (Array.isArray(cmsData.body)) {
          finalBody = cmsData.body;
        } else if (typeof cmsData.body === "string" && cmsData.body.trim()) {
          finalBody = [cmsData.body];
        }
        extraProps = {
          sections: cmsData.sections,
          metricsTitle: cmsData.metricsTitle,
          metrics: cmsData.metrics,
          tilesTitle: cmsData.tilesTitle,
          tiles: cmsData.tiles,
          stepsTitle: cmsData.stepsTitle,
          steps: cmsData.steps,
          outcomeTag: cmsData.outcomeTag,
          outcomeText: cmsData.outcomeText || cmsData.outcome,
        };
      }
    }

    const detailItem = {
      slug,
      title: finalTitle,
      summary: finalSummary,
      body: finalBody,
      ...extraProps,
    };

    const cmsImageSrc = extraProps?.image || extraProps?.photo || undefined;
    return <SectionDetail section={liveSection} item={detailItem} imageSrc={cmsImageSrc} />;
  }

  // Check for custom dynamic industry page created in Admin -> Industries
  const customPage: any = await getCustomPageBySlug(slug, { preview, pageType: "industry" });
  if (!customPage) return notFound();

  const sections = customPage.sections || [];
  const bodyParagraphs = sections
    .filter((s: any) => s.type === "richtext" || !s.type)
    .map((s: any) => s.data?.body || s.data?.heading || s.data?.lead)
    .filter(Boolean);

  if (bodyParagraphs.length === 0 && customPage.meta_description) {
    bodyParagraphs.push(customPage.meta_description);
  }

  const customItem = {
    slug: customPage.slug,
    title: customPage.title,
    summary: customPage.meta_description || "",
    body: bodyParagraphs,
  };

  const hasFaq = sections.some((s: any) => s.type === "faq");
  const faqs = hasFaq ? await listPublishedFaqs() : [];

  const heroSection = sections.find(
    (s: any) => (s.type === "hero" || s.section_type === "hero") && s.data?.image
  );
  const anyImageSection = sections.find((s: any) => s.data?.image || s.data?.photo);
  const customImageSrc =
    customPage.image ||
    heroSection?.data?.image ||
    anyImageSection?.data?.image ||
    anyImageSection?.data?.photo ||
    undefined;

  return (
    <SectionDetail section={liveSection} item={customItem} imageSrc={customImageSrc}>
      {sections.map((sec: any, idx: number) => {
        const d = sec.data || {};
        const type = sec.type || sec.section_type;

        switch (type) {
          case "hero":
            return (
              <div key={idx} className="mt-8 rounded-xl bg-paper-dim/60 p-6 border border-line">
                {d.eyebrow && (
                  <p
                    className="mono-tag text-xs"
                    style={{ color: d.eyebrowColor || "var(--color-eyebrow, #1F82C5)" }}
                  >
                    {d.eyebrow}
                  </p>
                )}
                {d.title && <h3 className="mt-1 font-display text-xl font-bold text-ink">{d.title}</h3>}
                {d.lead && <p className="mt-2 text-sm leading-relaxed text-slate">{d.lead}</p>}
                {d.image && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white p-3">
                    <img src={d.image} alt={d.title || ""} className="max-h-72 w-full object-contain rounded-lg" />
                  </div>
                )}
              </div>
            );

          case "richtext":
            return d.heading ? (
              <div key={idx} className="mt-6">
                <h3 className="font-display text-xl font-bold text-ink mb-2">{d.heading}</h3>
                {d.body && <p className="text-sm leading-relaxed text-ink/75 sm:text-[0.95rem]">{d.body}</p>}
              </div>
            ) : null;

          case "cards":
            return (
              <div key={idx} className="mt-8">
                {d.heading && <h3 className="font-display text-xl font-bold text-ink mb-4">{d.heading}</h3>}
                <div className="grid gap-4 sm:grid-cols-2">
                  {(d.items || []).map((card: any, ci: number) => (
                    <div key={ci} className="rounded-xl border border-line bg-paper-dim/30 p-5 shadow-2xs">
                      <h4 className="font-display text-base font-semibold text-ink">{card.title}</h4>
                      {card.description && <p className="mt-1.5 text-xs text-slate leading-relaxed">{card.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "stats":
            return (
              <div key={idx} className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-line py-6">
                {(d.items || []).map((st: any, si: number) => (
                  <div key={si} className="text-center">
                    <p className="font-display text-2xl font-bold text-indigo">{st.value}</p>
                    <p className="mt-1 text-xs text-slate">{st.label}</p>
                  </div>
                ))}
              </div>
            );

          case "image_text":
            return (
              <div key={idx} className="mt-8 grid gap-6 sm:grid-cols-2 items-center">
                <div>
                  {d.heading && <h3 className="font-display text-xl font-bold text-ink mb-2">{d.heading}</h3>}
                  {d.body && <p className="text-sm text-slate leading-relaxed">{d.body}</p>}
                </div>
                {d.image && (
                  <img src={d.image} alt={d.imageAlt || ""} className="rounded-xl border border-line object-cover max-h-60 w-full" />
                )}
              </div>
            );

          case "cta":
            return (
              <div key={idx} className="mt-8 rounded-xl bg-paper-dim p-6 border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-display text-base font-bold text-ink">{d.heading}</h4>
                </div>
                {d.buttonLabel && (
                  <Link href={d.buttonHref || "/contact"} className="rounded-lg bg-indigo px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-dark transition">
                    {d.buttonLabel}
                  </Link>
                )}
              </div>
            );

          case "faq":
            return faqs.length > 0 ? (
              <div key={idx} className="mt-8 divide-y divide-line">
                <h3 className="font-display text-xl font-bold text-ink mb-4">Frequently Asked Questions</h3>
                {faqs.map((f: any) => (
                  <div key={f.id || f.question} className="py-4">
                    <h4 className="font-display text-sm font-semibold text-ink">{f.question}</h4>
                    <p className="mt-1 text-xs text-slate leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            ) : null;

          default:
            return null;
        }
      })}
    </SectionDetail>
  );
}
