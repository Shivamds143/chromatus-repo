import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chromatus Consulting — Market Research & Strategy, Pune",
    template: "%s",
  },
  description:
    "Chromatus Consulting helps businesses understand their markets, their customers, and their competition — so every decision is backed by evidence, not guesswork.",
  metadataBase: new URL("https://chromatus.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Chromatus Consulting — Market Research & Strategy, Pune",
    description:
      "We turn data into decisions. Market research and business consulting across eight core industry verticals.",
    url: "https://chromatus.com",
    siteName: "Chromatus Consulting",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Chromatus Consulting — Market Research & Strategy, Pune",
    description:
      "We turn data into decisions. Market research and business consulting across eight core industry verticals.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Chromatus Consulting",
  url: "https://chromatus.com",
  logo: "https://chromatus.com/logo-icon.png",
  description:
    "Research and consulting firm helping organizations make better business decisions through data, headquartered in Pune, India.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sai Shilp, Near Universal, Warje",
    addressLocality: "Pune",
    postalCode: "411052",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-74984-65144",
    contactType: "customer service",
    email: "info@chromatus.com",
  },
  sameAs: [
    "https://www.linkedin.com/company/chromatusconsulting",
    "https://twitter.com/Chromatus12",
    "https://www.facebook.com/Chromatus-Consulting-100467295012830",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
