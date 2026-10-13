import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ExploreGrid from "@/components/ExploreGrid";
import Process from "@/components/Process";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import { getPageContent } from "@/lib/cms";
import { home } from "@/data/content/home";
import { listPublishedTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const content = await getPageContent("home", home);
  const testimonials = await listPublishedTestimonials();

  return (
    <>
      <Hero content={content?.hero} />
      <TrustStrip />
      <ExploreGrid />
      <Process content={content?.quote} />
      <WhyChoose content={content?.about} />
      <Testimonials items={testimonials as any} />
      <CTABanner content={content?.chromatusPro} />
    </>
  );
}
