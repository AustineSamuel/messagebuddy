"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/app/lib/api";
import { clearAuthToken, getAuthToken } from "@/app/lib/auth-token";
import { getProfile } from "@/app/services/users";
import { landingPageContent as c } from "./content";

type AuthState = "loading" | "guest" | "authenticated";

type Props = {
  variant?: "header" | "hero" | "cta";
};

export default function LandingAuthActions({ variant = "header" }: Props) {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setAuthState("guest");
        return;
      }

      try {
        await getProfile();
        if (!cancelled) setAuthState("authenticated");
      } catch (err) {
        if (isUnauthorizedError(err)) clearAuthToken();
        if (!cancelled) setAuthState("guest");
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === "loading") {
    return <div className="h-9 w-28 animate-pulse rounded-full lp-panel-inset" aria-hidden />;
  }

  if (authState === "authenticated") {
    if (variant === "hero") {
      return (
        <Link href={c.hero.dashboardCtaHref} className="lp-btn-primary">
          {c.hero.dashboardCta}
        </Link>
      );
    }

    if (variant === "cta") {
      return (
        <Link href={c.hero.dashboardCtaHref} className="lp-btn-cta-large">
          {c.hero.dashboardCta}
        </Link>
      );
    }

    return (
      <Link href={c.hero.dashboardCtaHref} className="lp-btn-register">
        {c.hero.dashboardCta}
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <>
        <Link href={c.hero.primaryCtaHref} className="lp-btn-primary">
          {c.hero.primaryCta}
        </Link>
        <Link href={c.hero.secondaryCtaHref} className="lp-btn-secondary">
          {c.hero.secondaryCta}
        </Link>
      </>
    );
  }

  if (variant === "cta") {
    return (
      <Link href={c.offer.primaryCtaHref} className="lp-btn-cta-large">
        {c.offer.primaryCta}
      </Link>
    );
  }

  return (
    <>
      <Link href={c.hero.secondaryCtaHref} className="lp-btn-signin">
        {c.hero.secondaryCta}
      </Link>
      <Link href={c.hero.primaryCtaHref} className="lp-btn-register">
        {c.hero.primaryCta}
      </Link>
    </>
  );
}
