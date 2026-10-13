import type { Metadata } from "next";
import SectionHub from "@/components/SectionHub";
import { industriesSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { industriesOverview } from "@/data/content/industries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Industries — Chromatus Consulting",
  description: industriesSection.intro,
};

export default async function IndustriesPage() {
  const content = await getPageContent("industriesOverview", industriesOverview);

  return (
    <SectionHub
      section={industriesSection}
      overrideEyebrow={content?.eyebrow}
      overrideTitle={content?.title}
      overrideIntro={content?.lead}
    />
  );
}
