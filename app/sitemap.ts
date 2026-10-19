import type { MetadataRoute } from "next";
import { sections } from "@/lib/content";
import { getSiteUrl, getNoindexPaths } from "@/lib/seo";
import { getRedirectedPaths } from "@/lib/redirects";
import { getIndustriesEnabled } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteUrl, noindexPaths, redirectedPaths, industriesEnabled] = await Promise.all([
    getSiteUrl().catch(() => "https://chromatus.com"),
    getNoindexPaths().catch(() => new Set<string>()),
    getRedirectedPaths().catch(() => new Set<string>()),
    getIndustriesEnabled().catch(() => true),
  ]);

  const staticRoutes = ["/", "/contact", "/faq", "/privacy-policy", "/terms", "/cookie-policy", "/careers", "/about", "/services", "/insights"];

  const activeSections = industriesEnabled
    ? sections
    : sections.filter((s) => s.path !== "/industries");

  const sectionRoutes = activeSections.flatMap((s) => [
    s.path,
    ...s.items.map((item) => `${s.path}/${item.slug}`),
  ]);

  const allPaths = Array.from(new Set([...staticRoutes, ...sectionRoutes]));

  return allPaths
    .filter((path) => {
      const normalized = path === "" ? "/" : path;
      if (noindexPaths.has(normalized)) return false;
      if (redirectedPaths.has(normalized)) return false;
      return true;
    })
    .map((path) => ({
      url: `${siteUrl}${path === "/" ? "" : path}`,
      lastModified: new Date(),
    }));
}
