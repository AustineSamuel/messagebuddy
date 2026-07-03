import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BusinessStorefront from "./BusinessStorefront";
import StoreNotFound from "@/app/storefront/StoreNotFound";
import {
  getBusinessStorefront,
  RESERVED_BUSINESS_SLUGS,
} from "@/app/services/storefront";

type Props = {
  params: Promise<{ businessSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params;
  const slug = decodeURIComponent(businessSlug).trim().toLowerCase();

  if (!slug || RESERVED_BUSINESS_SLUGS.has(slug)) {
    return { title: "Store not found" };
  }

  try {
    const data = await getBusinessStorefront(slug, { revalidate: 300 });
    const { business } = data;
    const title =
      business.seoTitle?.trim() ||
      `${business.name}${business.tagline ? ` — ${business.tagline}` : ""}`;
    const description =
      business.seoDescription?.trim() ||
      business.description?.trim() ||
      `Shop products from ${business.name}. Browse our catalog and contact us on WhatsApp.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: business.storeUrl || undefined,
        ...(business.logoUrl ? { images: [{ url: business.logoUrl, alt: business.name }] } : {}),
      },
      twitter: {
        card: business.logoUrl ? "summary_large_image" : "summary",
        title,
        description,
        ...(business.logoUrl ? { images: [business.logoUrl] } : {}),
      },
    };
  } catch {
    return { title: "Store not found" };
  }
}

export default async function BusinessStorePage({ params }: Props) {
  const { businessSlug } = await params;
  const slug = decodeURIComponent(businessSlug).trim().toLowerCase();

  if (!slug || RESERVED_BUSINESS_SLUGS.has(slug)) {
    notFound();
  }

  try {
    const data = await getBusinessStorefront(slug, { revalidate: 60 });
    return <BusinessStorefront business={data.business} products={data.products} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.toLowerCase().includes("fetch") || message.toLowerCase().includes("network")) {
      return <StoreNotFound slug={slug} reason="error" />;
    }
    return <StoreNotFound slug={slug} reason="missing" />;
  }
}
