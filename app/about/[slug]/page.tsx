import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionDetail from "@/components/SectionDetail";
import AboutVisuals from "@/components/AboutVisuals";
import { aboutSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { getDefaultForKey } from "@/lib/cmsDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

const SLUG_TO_CMS_KEY: Record<string, string> = {
  "our-story": "ourStory",
  "values-culture": "valuesCulture",
  "our-approach": "ourApproach",
};

export function generateStaticParams() {
  return aboutSection.items
    .filter((item) => item.slug !== "leadership-team")
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const item = aboutSection.items.find((i) => i.slug === slug);
  if (item) {
    const cmsKey = SLUG_TO_CMS_KEY[slug];
    if (cmsKey) {
      const fallback = getDefaultForKey(cmsKey);
      const cmsData = await getPageContent(cmsKey, fallback);
      if (cmsData?.title) {
        return { title: `${cmsData.title} — Chromatus Consulting` };
      }
    }
    return { title: `${item.title} — Chromatus Consulting` };
  }
  return { title: "Chromatus Consulting" };
}

export default async function AboutSubPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  let item = aboutSection.items.find((i) => i.slug === slug);
  if (!item) return notFound();

  const cmsKey = SLUG_TO_CMS_KEY[slug];
  let cmsData: any = null;
  if (cmsKey) {
    const fallback = getDefaultForKey(cmsKey);
    cmsData = await getPageContent(cmsKey, fallback);
    if (cmsData) {
      let bodyLines = item.body;
      let sections: any[] | undefined = undefined;

      if (Array.isArray(cmsData.sections) && cmsData.sections.length > 0) {
        sections = cmsData.sections;
        bodyLines = cmsData.sections.map((s: any) => `${s.heading ? s.heading + ": " : ""}${s.body}`);
      } else if (Array.isArray(cmsData.values) && cmsData.values.length > 0) {
        sections = cmsData.values.map((v: any) => ({ heading: v.title, body: v.body }));
        bodyLines = cmsData.values.map((v: any) => `${v.title ? v.title + " — " : ""}${v.body}`);
      } else if (Array.isArray(cmsData.steps) && cmsData.steps.length > 0) {
        sections = cmsData.steps.map((s: any) => ({
          heading: `${s.stage ? s.stage + " — " : ""}${s.title || ""}`,
          body: s.body || s.text || "",
        }));
        bodyLines = cmsData.steps.map((s: any) => `${s.stage ? s.stage + " — " : ""}${s.title ? s.title + ": " : ""}${s.body || s.text}`);
      } else if (Array.isArray(cmsData.body) && cmsData.body.length > 0) {
        bodyLines = cmsData.body;
      }

      item = {
        ...item,
        title: cmsData.title || item.title,
        summary: cmsData.lead || item.summary,
        body: bodyLines,
        sections: sections,
        metricsTitle: cmsData.metricsTitle,
        metrics: cmsData.metrics,
        tilesTitle: cmsData.tilesTitle,
        tiles: cmsData.tiles,
        stepsTitle: cmsData.stepsTitle,
        steps: cmsData.steps,
        outcomeTag: cmsData.outcomeTag,
        outcomeText: cmsData.outcomeText || cmsData.outcome,
        // Include CMS image so the header illustration can be overridden
        image: cmsData.image || cmsData.photo || undefined,
      };
    }
  }

  // Use the CMS-supplied image as the header illustration (overrides static fallback)
  const cmsImageSrc = cmsData?.image || cmsData?.photo || undefined;

  return (
    <SectionDetail section={aboutSection} item={item!} imageSrc={cmsImageSrc}>
      <AboutVisuals slug={slug} cmsData={cmsData} />
    </SectionDetail>
  );
}
