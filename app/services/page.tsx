import type { Metadata } from "next";
import SectionHub from "@/components/SectionHub";
import { servicesSection } from "@/lib/content";
import { getLiveServicesData } from "@/lib/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLiveServicesData();
  return {
    title: `${data.title || "Services"} — Chromatus Consulting`,
    description: data.intro || servicesSection.intro,
  };
}

export default async function ServicesPage() {
  const data = await getLiveServicesData();

  return (
    <SectionHub
      section={{
        ...servicesSection,
        eyebrow: data.eyebrow,
        title: data.title,
        intro: data.intro,
      }}
      overrideEyebrow={data.eyebrow}
      overrideTitle={data.title}
      overrideIntro={data.intro}
      overrideImage={data.image}
      items={data.items}
    />
  );
}
