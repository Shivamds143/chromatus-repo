import { getPageContent } from './cms';
import { aboutOverview } from '@/data/content/about';
import { aboutSection } from './content';

export type AboutOverviewData = {
  eyebrow: string;
  title: string;
  lead: string;
  image?: string;
  items: Array<{
    slug: string;
    title: string;
    summary: string;
    href: string;
  }>;
};

export async function getLiveAboutData(): Promise<AboutOverviewData> {
  const overview = await getPageContent('aboutOverview', aboutOverview).catch(() => null);

  const items = [
    {
      slug: 'about-overview',
      title: 'About Overview',
      summary: overview?.lead || aboutSection.intro,
      href: '/about',
    },
    ...aboutSection.items.map((it) => ({
      slug: it.slug,
      title: it.title,
      summary: it.summary,
      href: `${aboutSection.path}/${it.slug}`,
    })),
  ];

  return {
    eyebrow: overview?.eyebrow || aboutSection.eyebrow,
    title: overview?.title || aboutSection.title,
    lead: overview?.lead || aboutSection.intro,
    image: overview?.image || overview?.photo || undefined,
    items,
  };
}
