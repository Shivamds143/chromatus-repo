import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionDetail from "@/components/SectionDetail";
import ServiceVisuals from "@/components/ServiceVisuals";
import { servicesSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { getDefaultForKey } from "@/lib/cmsDefaults";
import { getCustomPageBySlug } from "@/lib/customPages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

const SLUG_TO_CMS_KEY: Record<string, string> = {
  "consumer-behaviour": "consumerBehaviour",
  "brand-management": "brandManagement",
  "new-product-launch": "newProductLaunch",
  "satisfaction-studies": "satisfactionStudies",
  "price-benchmarking": "priceBenchmarking",
  "location-feasibility-study": "locationFeasibilityStudy",
  "baseline-endline-study": "baselineEndlineStudy",
  "market-assessment": "marketAssessment",
  "government-surveys": "governmentSurveys",
};

export function generateStaticParams() {
  return servicesSection.items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const item = servicesSection.items.find((i) => i.slug === slug);
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
  const customPage: any = await getCustomPageBySlug(slug, { pageType: "service" });
  if (customPage) {
    return { title: `${customPage.title} — Chromatus Consulting` };
  }
  return { title: "Chromatus Consulting" };
}

export default async function ServicesSubPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  let item = servicesSection.items.find((i) => i.slug === slug);

  if (item) {
    const cmsKey = SLUG_TO_CMS_KEY[slug];
    if (cmsKey) {
      const fallback = getDefaultForKey(cmsKey);
      const cmsData = await getPageContent(cmsKey, fallback);
      if (cmsData) {
        item = {
          ...item,
          title: cmsData.title || item.title,
          summary: cmsData.lead || item.summary,
          body: Array.isArray(cmsData.body)
            ? cmsData.body
            : typeof cmsData.body === "string"
            ? [cmsData.body]
            : item.body,
        };
      }
    }
    return (
      <SectionDetail section={servicesSection} item={item}>
        <ServiceVisuals slug={slug} />
      </SectionDetail>
    );
  }

  // Check for custom dynamic service page created in Admin -> Services
  const customPage: any = await getCustomPageBySlug(slug, { pageType: "service" });
  if (!customPage) return notFound();

  const customItem = {
    slug: customPage.slug,
    title: customPage.title,
    summary: customPage.meta_description || "",
    body: (customPage.sections || [])
      .map((s: any) => s.data?.body || s.data?.heading || s.data?.lead)
      .filter(Boolean),
  };

  return <SectionDetail section={servicesSection} item={customItem} />;
}
