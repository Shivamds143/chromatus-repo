import type { Metadata } from "next";
import SectionHub from "@/components/SectionHub";
import { servicesSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { servicesOverview } from "@/data/content/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Services — Chromatus Consulting",
  description: servicesSection.intro,
};

export default async function ServicesPage() {
  const content = await getPageContent("servicesOverview", servicesOverview);

  return (
    <SectionHub
      section={servicesSection}
      overrideEyebrow={content?.eyebrow}
      overrideTitle={content?.title}
      overrideIntro={content?.lead}
    />
  );
}
