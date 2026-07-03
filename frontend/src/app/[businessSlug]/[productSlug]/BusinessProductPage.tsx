"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatStorePrice,
  recordBusinessCheckout,
  whatsAppUrl,
  type PublicBusinessProfile,
} from "@/app/services/storefront";
import StorefrontShell from "@/app/storefront/StorefrontShell";
import type { Product } from "@/dashboard/types";

type Props = {
  business: PublicBusinessProfile;
  product: Product;
};

function stockDot(stock: Product["stock"]) {
  if (stock === "out") return "sf-stock-out";
  if (stock === "low") return "sf-stock-low";
  return "sf-stock-in";
}

export default function BusinessProductPage({ business, product: initialProduct }: Props) {
  const [product, setProduct] = useState(initialProduct);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const images = product.images?.length ? product.images : [];
  const cover = images[activeImage];
  const priceLabel = formatStorePrice(product.price, product.currency);
  const outOfStock = product.stock === "out";
  const waUrl = whatsAppUrl(
    business.phone,
    `Hi ${business.name}, I'm interested in ${product.name} (${priceLabel}).`
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleCheckout = async () => {
    setOrdering(true);
    try {
      const result = await recordBusinessCheckout(business.slug, product.slug);
      setProduct(result.product);
      setOrdered(true);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <StorefrontShell
      business={business}
      backHref={`/${business.slug}`}
      backLabel="← Lineup"
      showWhatsApp={false}
      compact
    >
      <section className="sf-rise pb-8 pt-6 text-center md:pb-10 md:pt-8">
        <p className="mb-3 text-sm font-medium text-[#86868b]">{business.name}</p>
        <h1 className="sf-hero-title mb-3 text-[clamp(2rem,6vw,3.25rem)]">{product.name}</h1>
        {product.description ? (
          <p className="sf-hero-sub mx-auto">{product.description.split("\n")[0]}</p>
        ) : (
          <p className="sf-hero-sub mx-auto">Available with WhatsApp checkout.</p>
        )}
        <p className="mt-4 text-xl font-semibold text-[#1d1d1f] md:text-2xl">From {priceLabel}</p>
        <p className="mt-2 flex items-center justify-center text-sm text-[#86868b]">
          <span className={`sf-stock-dot ${stockDot(product.stock)}`} />
          {product.stock === "in" ? "In stock" : product.stock === "low" ? "Limited stock" : "Out of stock"}
          {product.totalSold > 0 ? ` · ${product.totalSold.toLocaleString()} sold` : ""}
        </p>
      </section>

      <section className="sf-rise sf-rise-delay mb-10 md:mb-12">
        <div className="sf-product-hero-image">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={product.name}
              className="max-h-[min(65vw,480px)] max-w-full object-contain"
            />
          ) : (
            <span className="text-[clamp(4rem,15vw,8rem)]">{product.emoji ?? "📦"}</span>
          )}
        </div>

        {images.length > 1 ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {images.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-14 w-14 overflow-hidden rounded-xl border-2 bg-white p-1 transition ${
                  activeImage === i ? "border-[var(--sf-accent)]" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        {product.description ? (
          <section className="sf-band lg:col-span-1">
            <h2 className="mb-4 text-xl font-semibold tracking-tight text-[#1d1d1f]">Take a closer look.</h2>
            <p className="whitespace-pre-wrap text-base leading-[1.7] text-[#6e6e73]">{product.description}</p>
          </section>
        ) : (
          <div />
        )}

        <aside className="sf-buy-panel sf-rise">
          <p className="mb-1 text-2xl font-semibold tracking-tight text-[#1d1d1f]">{priceLabel}</p>
          <p className="mb-6 text-sm text-[#86868b]">Sold by {business.name}</p>

          {ordered ? (
            <div className="mb-4 rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm text-[#047857]">
              <strong className="block font-semibold">You&apos;re on the list.</strong>
              The seller will reach out on WhatsApp.
            </div>
          ) : null}

          <button
            type="button"
            disabled={outOfStock || ordering}
            onClick={() => void handleCheckout()}
            className="sf-btn-buy mb-3 w-full py-3 text-[17px]"
          >
            {outOfStock ? "Unavailable" : ordering ? "Processing…" : "Buy"}
          </button>

          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sf-btn-buy sf-btn-whatsapp mb-4 flex w-full py-3 text-[17px]"
            >
              Ask on WhatsApp
            </a>
          ) : null}

          {business.phone ? (
            <p className="text-center text-sm text-[#86868b]">
              Or call{" "}
              <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="sf-link">
                {business.phone}
              </a>
            </p>
          ) : null}

          <ul className="mt-6 space-y-2 border-t border-[#d2d2d7] pt-5 text-xs text-[#86868b]">
            <li>Free to view — no account needed</li>
            <li>Checkout records your interest with the seller</li>
            <li>Continue the conversation on WhatsApp</li>
          </ul>
        </aside>
      </div>

      <section className="mt-14 text-center md:mt-16">
        <Link href={`/${business.slug}`} className="sf-link text-lg">
          Compare more products ›
        </Link>
      </section>

      {isMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d2d2d7] bg-white/80 px-5 py-3 backdrop-blur-xl pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-[980px] items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-[#86868b]">{product.name}</div>
              <div className="text-lg font-semibold text-[#1d1d1f]">{priceLabel}</div>
            </div>
            <button
              type="button"
              disabled={outOfStock || ordering}
              onClick={() => void handleCheckout()}
              className="sf-btn-buy shrink-0 px-6"
            >
              {outOfStock ? "Unavailable" : ordered ? "Done" : "Buy"}
            </button>
          </div>
        </div>
      ) : null}

      {isMobile ? <div className="h-24" aria-hidden /> : null}
    </StorefrontShell>
  );
}
