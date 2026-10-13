import type { MetadataRoute } from "next";
import { sections } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://chromatus.com";
  const staticRoutes = ["", "/contact", "/faq", "/privacy-policy", "/terms", "/cookie-policy"];

  const sectionRoutes = sections.flatMap((s) => [
    s.path,
    ...s.items.map((item) => `${s.path}/${item.slug}`),
  ]);

  return [...staticRoutes, ...sectionRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
