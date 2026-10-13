import type { Metadata } from "next";
import SectionHub from "@/components/SectionHub";
import { aboutSection } from "@/lib/content";
import { getPageContent } from "@/lib/cms";
import { aboutOverview } from "@/data/content/about";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "About Us — Chromatus Consulting",
  description: aboutSection.intro,
};

export default async function AboutPage() {
  const content = await getPageContent("aboutOverview", aboutOverview);

  return (
    <SectionHub
      section={aboutSection}
      overrideEyebrow={content?.eyebrow}
      overrideTitle={content?.title}
      overrideIntro={content?.lead}
    />
  );
}
