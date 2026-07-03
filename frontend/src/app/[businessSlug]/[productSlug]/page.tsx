import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BusinessProductPage from "./BusinessProductPage";
import {
  getBusinessProduct,
  RESERVED_BUSINESS_SLUGS,
} from "@/app/services/storefront";
import { formatStorePrice } from "@/app/services/storefront";

type Props = {
  params: Promise<{ businessSlug: string; productSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug, productSlug } = await params;
  const slug = decodeURIComponent(businessSlug).trim().toLowerCase();

  if (!slug || RESERVED_BUSINESS_SLUGS.has(slug)) {
    return { title: "Product not found" };
  }

  try {
    const data = await getBusinessProduct(slug, productSlug, { revalidate: 300 });
    const { business, product } = data;
    const price = formatStorePrice(product.price, product.currency);
    const title =
      business.seoTitle?.trim() ||
      `${product.name} — ${business.name}`;
    const description =
      product.description?.trim() ||
      business.seoDescription?.trim() ||
      `${product.name} from ${business.name}. ${price}. Contact us on WhatsApp to order.`;

    const image = product.images?.[0] ?? business.logoUrl ?? undefined;

    return {
      title,
      description,
      openGraph: {
        title: `${product.name} — ${business.name}`,
        description,
        type: "website",
        ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: `${product.name} — ${business.name}`,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: "Product not found" };
  }
}

export default async function ProductStorePage({ params }: Props) {
  const { businessSlug, productSlug } = await params;
  const slug = decodeURIComponent(businessSlug).trim().toLowerCase();

  if (!slug || RESERVED_BUSINESS_SLUGS.has(slug)) {
    notFound();
  }

  try {
    const data = await getBusinessProduct(slug, productSlug, { revalidate: 60 });
    return (
      <BusinessProductPage business={data.business} product={data.product} />
    );
  } catch {
    notFound();
  }
}
