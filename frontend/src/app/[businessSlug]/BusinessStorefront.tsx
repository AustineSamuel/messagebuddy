"use client";

import { useMemo } from "react";
import type { PublicBusinessProfile } from "@/app/services/storefront";
import { whatsAppUrl } from "@/app/services/storefront";
import StoreProductCard from "@/app/storefront/StoreProductCard";
import StorefrontShell from "@/app/storefront/StorefrontShell";
import type { Product } from "@/dashboard/types";

type Props = {
  business: PublicBusinessProfile;
  products: Product[];
};

export default function BusinessStorefront({ business, products }: Props) {
  const waGeneral = whatsAppUrl(
    business.phone,
    `Hi ${business.name}, I'd like to know more about your products.`
  );

  const heroLines = useMemo(() => {
    return business.tagline?.trim() || `Shop the latest from ${business.name}.`;
  }, [business.tagline, business.name]);

  return (
    <StorefrontShell business={business}>
      <section className="sf-rise pb-12 pt-10 text-center md:pb-16 md:pt-14">
        <h1 className="sf-hero-title mb-4">{business.name}</h1>
        <p className="sf-hero-sub mx-auto">{heroLines}</p>
        {business.description ? (
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#86868b]">{business.description}</p>
        ) : null}
        {waGeneral ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="sf-link text-lg">
              Contact us ›
            </a>
            {products.length > 0 ? (
              <a href="#lineup" className="sf-btn-buy">
                Shop now
              </a>
            ) : null}
          </div>
        ) : null}
      </section>

      <section id="lineup" className="sf-rise sf-rise-delay mb-16 md:mb-20">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="sf-section-label">Explore the lineup.</h2>
          {products.length > 0 ? (
            <p className="mt-2 text-sm text-[#86868b]">{products.length} products available</p>
          ) : null}
        </div>

        {products.length === 0 ? (
          <div className="sf-band text-center">
            <p className="sf-hero-sub mx-auto">New products are on the way.</p>
            {waGeneral ? (
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="sf-btn-buy sf-btn-whatsapp mt-6 inline-flex">
                Message on WhatsApp
              </a>
            ) : null}
          </div>
        ) : (
          <div className="sf-lineup-scroll">
            {products.map((p) => (
              <StoreProductCard key={p.id} product={p} businessSlug={business.slug} />
            ))}
          </div>
        )}
      </section>

      <section className="sf-band-dark sf-rise mb-12 text-center md:mb-16">
        <h2 className="sf-section-label mb-3 text-white">Why shop with us.</h2>
        <p className="sf-hero-sub mx-auto mb-10">
          Browse products, checkout in one tap, and finish on WhatsApp with a real person.
        </p>
        <div className="mx-auto grid max-w-2xl gap-8 sm:grid-cols-3">
          {[
            { title: "No login", sub: "Open, browse, and checkout instantly." },
            { title: "WhatsApp", sub: "Talk to the seller directly after you order." },
            { title: "Secure", sub: "Your interest is recorded safely every time." },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[#a1a1a6]">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {(business.description || business.address || business.phone) && (
        <section className="sf-band sf-rise">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="sf-section-label mb-4 text-[1.75rem]">Get to know {business.name}.</h2>
            {business.description ? (
              <p className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-[#6e6e73]">
                {business.description}
              </p>
            ) : null}
            {business.address ? (
              <p className="mb-4 text-sm text-[#86868b]">{business.address}</p>
            ) : null}
            {business.phone ? (
              <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="sf-link text-lg">
                {business.phone} ›
              </a>
            ) : null}
            {waGeneral ? (
              <div className="mt-6">
                <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="sf-btn-buy sf-btn-whatsapp">
                  Chat on WhatsApp
                </a>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </StorefrontShell>
  );
}
