import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import ExploreGrid from "@/components/ExploreGrid";
import Process from "@/components/Process";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import { getPageContent } from "@/lib/cms";
import { home } from "@/data/content/home";
import { listPublishedTestimonials } from "@/lib/testimonials";
import { listPublishedClients } from "@/lib/clients";
import { getLiveServicesData } from "@/lib/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const content = await getPageContent("home", home);
  const [testimonials, clientLogos, servicesData] = await Promise.all([
    listPublishedTestimonials(),
    listPublishedClients(),
    getLiveServicesData(),
  ]);

  return (
    <>
      <Hero content={content?.hero} />
      <ClientLogos items={clientLogos as any} />
      <ExploreGrid
        servicesData={servicesData}
        content={(content as any)?.servicesAndCapabilities || (content as any)?.capabilities || (content as any)?.services}
      />
      <Process content={(content as any)?.ourApproach || (content as any)?.quote} />
      <WhyChoose content={content?.about} />
      <Testimonials
        items={testimonials as any}
        content={(content as any)?.clientPerspectives || (content as any)?.clientPerspective}
      />
      <CTABanner content={content?.chromatusPro} />
    </>
  );
}
