import type { Metadata } from "next";
import LandingPage from "@/module/landing-page/LandingPage";
import { landingPageContent } from "@/module/landing-page/content";

export const metadata: Metadata = {
  title: landingPageContent.seo.title,
  description: landingPageContent.seo.description,
  keywords: [...landingPageContent.seo.keywords],
  openGraph: {
    title: landingPageContent.seo.title,
    description: landingPageContent.seo.description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: landingPageContent.seo.title,
    description: landingPageContent.seo.description,
  },
};

export default function Home() {
  return <LandingPage />;
}
