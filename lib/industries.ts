import { getPageContent, listSavedPageStatus } from './cms';
import { industriesOverview } from '@/data/content/industries';
import { industriesSection, type SubItem } from './content';
import { getPublishedCustomPages } from './customPages';
import { isPreviewActive } from './preview';
import { getDefaultForKey } from './cmsDefaults';
import { itemIconMap } from './icons';

export type IndustryCardItem = {
  slug: string;
  title: string;
  summary: string;
  href: string;
  icon: string;
  color: string;
  isCustom?: boolean;
};

export type LiveIndustriesData = {
  eyebrow: string;
  title: string;
  intro: string;
  items: IndustryCardItem[];
};

export const industryBarColors = [
  "#1F82C5",
  "#EA9322",
  "#15619B",
  "#F2AC52",
  "#3D9FDE",
  "#C97614",
  "#0D9488",
  "#8B5CF6"
];

export function resolveIndustryColor(color?: string, index: number = 0): string {
  if (!color) return industryBarColors[index % industryBarColors.length];
  const colorMap: Record<string, string> = {
    brandblue: "#1F82C5",
    brandorange: "#EA9322",
    purple: "#8B5CF6",
    teal: "#0D9488",
    indigo: "#15619B",
    navy: "#0A2540",
  };
  return colorMap[color.toLowerCase()] || (color.startsWith("#") ? color : industryBarColors[index % industryBarColors.length]);
}

export const INDUSTRY_SLUG_TO_CMS_KEY: Record<string, string> = {
  "healthcare": "healthcare",
  "automotive-transportation": "automotiveTransportation",
  "food-beverages": "foodBeverages",
  "telecom-it": "telecomIt",
  "aerospace-defense": "aerospaceDefense",
  "semiconductors-electronics": "semiconductorsElectronics",
  "energy-power": "energyPower",
  "chemicals-materials": "chemicalsMaterials",
  "beyond-these-eight": "beyondTheseEight",
};

export async function getLiveIndustriesData(): Promise<LiveIndustriesData> {
  const preview = await isPreviewActive();

  // 1. Get overview content from CMS or fallback
  const overview = await getPageContent("industriesOverview", industriesOverview);

  // 2. Check if individual core industry pages have saved CMS overrides
  const savedMap = (await listSavedPageStatus().catch(() => ({}))) as Record<string, any>;

  const coreOverrides: Record<string, { title?: string; lead?: string }> = {};
  await Promise.all(
    Object.entries(INDUSTRY_SLUG_TO_CMS_KEY).map(async ([slug, cmsKey]) => {
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

  // 3. Get published custom industry pages (from Admin -> Industries)
  const customPages = await getPublishedCustomPages("industry", { preview });

  // 4. Build items list from industriesOverview.cards or industriesSection.items
  const baseCards: any[] =
    Array.isArray(overview?.cards) && overview.cards.length > 0
      ? overview.cards
      : (industriesOverview as any).cards || [];

  const items: IndustryCardItem[] = [];
  const seenSlugs = new Set<string>();

  baseCards.forEach((card: any, idx: number) => {
    let slug = card.slug;
    if (!slug && card.href) {
      slug = card.href.replace(/^\/industries\/?/, "").replace(/^\//, "").split("?")[0];
    }
    if (!slug) {
      slug = card.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `industry-${idx}`;
    }

    const override = coreOverrides[slug];
    const title = override?.title || card.title || slug;
    const summary = card.body || card.summary || override?.lead || "";
    const href = card.href || `/industries/${slug}`;
    const icon = card.icon || itemIconMap[slug] || "factory";
    const color = resolveIndustryColor(card.color, idx);

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

  // If baseCards didn't have all core items from industriesSection, add remaining ones
  industriesSection.items.forEach((coreItem, idx) => {
    if (!seenSlugs.has(coreItem.slug)) {
      const override = coreOverrides[coreItem.slug];
      const color = resolveIndustryColor(undefined, items.length);
      items.push({
        slug: coreItem.slug,
        title: override?.title || coreItem.title,
        summary: override?.lead || coreItem.summary,
        href: `/industries/${coreItem.slug}`,
        icon: itemIconMap[coreItem.slug] || "factory",
        color,
        isCustom: false,
      });
      seenSlugs.add(coreItem.slug);
    }
  });

  // 5. Append dynamic custom industry pages added via Admin -> Industries
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

    const color = industryBarColors[items.length % industryBarColors.length];
    items.push({
      slug: cp.slug,
      title: cp.title || cp.slug,
      summary: cp.meta_description || "",
      href: `/industries/${cp.slug}`,
      icon: "factory",
      color,
      isCustom: true,
    });
    seenSlugs.add(cp.slug);
  });

  return {
    eyebrow: overview?.eyebrow || industriesSection.eyebrow,
    title: overview?.title || industriesSection.title,
    intro: overview?.lead || industriesSection.intro,
    items,
  };
}
