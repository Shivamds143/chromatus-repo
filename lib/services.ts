import { getPageContent, listSavedPageStatus } from './cms';
import { servicesOverview } from '@/data/content/services';
import { servicesSection, type SubItem } from './content';
import { getPublishedCustomPages } from './customPages';
import { isPreviewActive } from './preview';
import { getDefaultForKey } from './cmsDefaults';
import { itemIconMap } from './icons';

export type ServiceCardItem = {
  slug: string;
  title: string;
  summary: string;
  href: string;
  icon: string;
  color: string;
  isCustom?: boolean;
};

export type LiveServicesData = {
  eyebrow: string;
  title: string;
  intro: string;
  image?: string;
  items: ServiceCardItem[];
};

export const barColors = ["#1F82C5", "#EA9322", "#15619B", "#F2AC52", "#3D9FDE", "#C97614"];

export function resolveServiceColor(color?: string, index: number = 0): string {
  if (!color) return barColors[index % barColors.length];
  const colorMap: Record<string, string> = {
    brandblue: "#1F82C5",
    brandorange: "#EA9322",
    purple: "#8B5CF6",
    teal: "#0D9488",
    indigo: "#15619B",
    navy: "#0A2540",
  };
  return colorMap[color.toLowerCase()] || (color.startsWith("#") ? color : barColors[index % barColors.length]);
}

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

export async function getLiveServicesData(): Promise<LiveServicesData> {
  const preview = await isPreviewActive();

  // 1. Get services overview (headline, eyebrow, intro, cards)
  const overview = await getPageContent("servicesOverview", servicesOverview);

  // 2. Check if individual core service pages have been updated in CMS
  const savedMap = (await listSavedPageStatus().catch(() => ({}))) as Record<string, any>;

  const coreOverrides: Record<string, { title?: string; lead?: string }> = {};
  await Promise.all(
    Object.entries(SLUG_TO_CMS_KEY).map(async ([slug, cmsKey]) => {
      const status = savedMap[cmsKey];
      if (status?.isPublished || (preview && status)) {
        try {
          const fallback = getDefaultForKey(cmsKey);
          const data = await getPageContent(cmsKey, fallback);
          if (data) {
            coreOverrides[slug] = {
              title: data.title,
              lead: data.lead,
            };
          }
        } catch {
          // ignore error
        }
      }
    })
  );

  // 3. Get published custom service pages (from Admin -> Services)
  const customPages = await getPublishedCustomPages("service", { preview });

  // 4. Build items list from servicesOverview.cards
  const baseCards: any[] =
    Array.isArray(overview?.cards) && overview.cards.length > 0
      ? overview.cards
      : servicesOverview.cards;

  const items: ServiceCardItem[] = [];
  const seenSlugs = new Set<string>();

  baseCards.forEach((card: any, idx: number) => {
    let slug = card.slug;
    if (!slug && card.href) {
      slug = card.href.replace(/^\/services\/?/, "").replace(/^\//, "").split("?")[0];
    }
    if (!slug) {
      slug = card.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `service-${idx}`;
    }

    const override = coreOverrides[slug];
    // If the card title/summary was not individually customized in overview.cards, allow individual page update to take effect
    const title = override?.title || card.title || slug;
    const summary = card.body || card.summary || override?.lead || "";
    const href = card.href || `/services/${slug}`;
    const icon = card.icon || itemIconMap[slug] || "target";
    const color = resolveServiceColor(card.color, idx);

    items.push({
      slug,
      title,
      summary,
      href,
      icon,
      color,
      isCustom: false,
    });
    seenSlugs.add(slug);
  });

  // 5. Append dynamic custom service pages added via Admin -> Services
  (customPages || []).forEach((cp: any) => {
    if (!cp.slug) return;
    if (seenSlugs.has(cp.slug)) {
      const existing = items.find((i) => i.slug === cp.slug);
      if (existing) {
        if (!existing.title || existing.title === existing.slug) {
          existing.title = cp.title;
        }
        if (!existing.summary && cp.meta_description) {
          existing.summary = cp.meta_description;
        }
      }
      return;
    }

    const color = barColors[items.length % barColors.length];
    items.push({
      slug: cp.slug,
      title: cp.title || cp.slug,
      summary: cp.meta_description || "",
      href: `/services/${cp.slug}`,
      icon: "target",
      color,
      isCustom: true,
    });
    seenSlugs.add(cp.slug);
  });

  return {
    eyebrow: overview?.eyebrow || servicesSection.eyebrow,
    title: overview?.title || servicesSection.title,
    intro: overview?.lead || servicesSection.intro,
    image: overview?.image || overview?.photo || undefined,
    items,
  };
}
