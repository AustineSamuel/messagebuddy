"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { whatsAppUrl, type PublicBusinessProfile } from "@/app/services/storefront";
import StorefrontHeaderShare from "@/app/storefront/StorefrontHeaderShare";
import { storeGreen } from "@/app/storefront/storefront-styles";
import "./storefront.css";

type Props = {
  business: PublicBusinessProfile;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  showWhatsApp?: boolean;
  compact?: boolean;
};

export default function StorefrontShell({
  business,
  backHref,
  backLabel,
  children,
  showWhatsApp = true,
  compact = false,
}: Props) {
  const accent = storeGreen(business.accentColor);
  const storeUrl = useMemo(() => {
    if (business.storeUrl) return business.storeUrl;
    if (typeof window !== "undefined") return `${window.location.origin}/${business.slug}`;
    return `/${business.slug}`;
  }, [business.storeUrl, business.slug]);

  const waUrl = whatsAppUrl(
    business.phone,
    `Hi ${business.name}, I'd like to know more about your products.`
  );

  return (
    <div className="sf-root" style={{ ["--sf-accent" as string]: accent, ["--sf-accent-hover" as string]: accent }}>
      <header className="sf-header">
        <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8 md:py-3.5">
          {backHref ? (
            <Link href={backHref} className="flex min-w-0 items-center gap-3 no-underline text-inherit">
              <BrandMark business={business} accent={accent} small />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[#1d1d1f]">{business.name}</div>
                <div className="text-xs sf-accent-text">{backLabel ?? "← Store"}</div>
              </div>
            </Link>
          ) : (
            <Link href={`/${business.slug}`} className="flex min-w-0 items-center gap-3 no-underline text-inherit">
              <BrandMark business={business} accent={accent} />
              {!compact ? (
                <span className="hidden truncate text-sm font-semibold text-[#1d1d1f] sm:inline">
                  {business.name}
                </span>
              ) : null}
            </Link>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {storeUrl ? (
              <StorefrontHeaderShare url={storeUrl} businessName={business.name} accent={accent} />
            ) : null}
            {showWhatsApp && waUrl ? (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="sf-btn-buy sf-btn-whatsapp text-sm">
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[980px] px-5 pb-20 pt-2 md:px-8 md:pt-4">{children}</main>

      <footer className="sf-footer mx-auto max-w-[980px] px-5 md:px-8">
        <p className="mb-1 text-sm font-medium text-[#1d1d1f]">{business.name}</p>
        <p>
          Powered by{" "}
          <a href="/" className="sf-accent-text no-underline hover:underline">
            MessageBuddy
          </a>
        </p>
      </footer>
    </div>
  );
}

function BrandMark({
  business,
  accent,
  small,
}: {
  business: PublicBusinessProfile;
  accent: string;
  small?: boolean;
}) {
  const size = small ? "h-9 w-9" : "h-8 w-8";

  if (business.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={business.logoUrl}
        alt={business.name}
        className={`${size} shrink-0 rounded-lg object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white`}
      style={{ background: accent }}
    >
      {business.name.charAt(0).toUpperCase() || "S"}
    </div>
  );
}
