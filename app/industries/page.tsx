import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionHub from "@/components/SectionHub";
import { industriesSection } from "@/lib/content";
import { getLiveIndustriesData } from "@/lib/industries";
import { getIndustriesEnabled } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await getIndustriesEnabled();
  if (!enabled) return { title: "Not Found" };
  const data = await getLiveIndustriesData();
  return {
    title: `${data.title || "Industries"} — Chromatus Consulting`,
    description: data.intro || industriesSection.intro,
  };
}

export default async function IndustriesPage() {
  const enabled = await getIndustriesEnabled();
  if (!enabled) return notFound();

  const data = await getLiveIndustriesData();

  return (
    <SectionHub
      section={{
        ...industriesSection,
        eyebrow: data.eyebrow,
        title: data.title,
        intro: data.intro,
      }}
      overrideEyebrow={data.eyebrow}
      overrideTitle={data.title}
      overrideIntro={data.intro}
      items={data.items}
    />
  );
}

