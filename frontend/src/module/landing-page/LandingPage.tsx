"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardPreview from "./DashboardPreview";
import HeroSection from "./hero/HeroSection";
import InView from "./InView";
import LandingAuthActions from "./LandingAuthActions";
import LandingHeader from "./LandingHeader";
import LandingIcon from "./LandingIcons";
import { landingPageContent as c } from "./content";
import { getStoredLandingTheme, storeLandingTheme, type LandingTheme } from "./theme";
import "./hero/hero-section.css";
import "./hero-phone-3d/hero-phone-3d.css";
import "./landing-page.css";

function useBrowserHost() {
  const [host, setHost] = useState("");

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  return host;
}

function StorefrontPreview({ compact = false }: { compact?: boolean }) {
  const host = useBrowserHost();
  const { urlSlug, imageSrc, imageAlt } = c.storefront;
  const displayHost = host || "…";
  const shopPath = `${displayHost}/${urlSlug}`;

  return (
    <figure className={`lp-shop-preview ${compact ? "lp-shop-preview--compact" : ""}`}>
      <div className="lp-shop-preview__browser" aria-hidden={!compact}>
        <div className="lp-shop-preview__chrome">
          <span className="lp-shop-preview__dots" aria-hidden>
            <i /><i /><i />
          </span>
          <div className="lp-shop-preview__url" aria-label={`Store URL ${shopPath}`}>
            <span className="lp-shop-preview__lock" aria-hidden>
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="lp-shop-preview__host">{displayHost}</span>
            <span className="lp-shop-preview__slash">/</span>
            <span className="lp-shop-preview__slug">{urlSlug}</span>
          </div>
        </div>
        <div className="lp-shop-preview__screen">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1030}
            height={776}
            className="lp-shop-preview__image"
            sizes={compact ? "(max-width: 768px) 100vw, 420px" : "(max-width: 768px) 100vw, 900px"}
            priority={!compact}
          />
        </div>
      </div>
      {!compact ? (
        <figcaption className="lp-shop-preview__caption">
          Live shop link: <code>{shopPath}</code>
        </figcaption>
      ) : null}
    </figure>
  );
}

function WorkflowVisual({ id }: { id: string }) {
  if (id === "automate") {
    return (
      <div className="lp-workflow-card lp-workflow-card--chat">
        <div className="lp-workflow-card__chrome">
          <span className="lp-workflow-card__status">
            <span className="lp-workflow-card__status-dot" />
            Auto-reply active
          </span>
          <span className="lp-workflow-card__live">Online</span>
        </div>

        <div className="lp-workflow-chat">
          <div className="lp-workflow-chat__meta">Today · Ada</div>

          <div className="lp-workflow-bubble lp-workflow-bubble--in">
            <p>How much for delivery?</p>
            <span>10:41 AM</span>
          </div>

          <div className="lp-workflow-bubble lp-workflow-bubble--out">
            <span className="lp-workflow-bubble__ai">AI</span>
            <p>Delivery to your area is ₦2,500. Share your address to confirm.</p>
            <span>
              10:41 AM
              <svg className="lp-workflow-bubble__ticks" viewBox="0 0 24 16" aria-hidden>
                <path d="M1.5 8.2l3.4 3.4L12.2 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M8.2 8.2l3.4 3.4L19.8 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
          </div>

          <div className="lp-workflow-bubble lp-workflow-bubble--typing" aria-hidden>
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  if (id === "sell") {
    return <StorefrontPreview compact />;
  }

  if (id === "grow") {
    return (
      <div className="lp-workflow-card lp-workflow-card--chart">
        <div className="lp-workflow-card__chrome">
          <span className="lp-workflow-card__status">Messages sent</span>
          <span className="lp-accent text-xs font-semibold">+24% this week</span>
        </div>
        <div className="lp-workflow-chart">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="lp-workflow-chart__col">
              <div className="lp-workflow-chart__bar" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <DashboardPreview noInputs />;
}

function ShopUrlPill() {
  const host = useBrowserHost();
  const displayHost = host || "…";

  return (
    <p className="lp-shop-showcase__url-pill">
      <span className="lp-shop-showcase__url-host">{displayHost}</span>
      <span className="lp-shop-showcase__url-slash">/</span>
      <span className="lp-shop-showcase__url-slug">{c.storefront.urlSlug}</span>
    </p>
  );
}

export default function LandingPage() {
  const [theme, setTheme] = useState<LandingTheme>("dark");
  const siteHost = useBrowserHost();
  const shopExamplePath = siteHost
    ? `${siteHost}/${c.storefront.urlSlug}`
    : `…/${c.storefront.urlSlug}`;

  useEffect(() => {
    setTheme(getStoredLandingTheme());

    document.documentElement.classList.add("landing-active");
    document.querySelectorAll('link[href="/dashboard.css"]').forEach((el) => el.remove());
    document.body.style.overflow = "";
    document.body.style.height = "";
    document.documentElement.style.overflow = "";

    return () => {
      document.documentElement.classList.remove("landing-active");
      document.documentElement.style.removeProperty("background");
      document.body.style.removeProperty("background");
    };
  }, []);

  useEffect(() => {
    const bg = theme === "light" ? "#fafafa" : "#08090a";
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      storeLandingTheme(next);
      return next;
    });
  }

  return (
    <div className="landing-page relative min-h-screen w-full flex-1" data-theme={theme}>
      <div className="landing-page__hero-bleed">
        <div className="landing-page__hero-bleed-inner">
          <LandingHeader theme={theme} onToggleTheme={toggleTheme} />
          <HeroSection />
        </div>
          </div>

      <div className="landing-page__shell relative z-10">
        <main>
          <InView className="mx-auto mt-14 w-full max-w-5xl md:mt-20" delay={120}>
            <DashboardPreview />
          </InView>

          <section className="lp-pillars mx-auto mt-24 max-w-5xl">
            <InView className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight lp-text md:text-4xl">{c.pillars.title}</h2>
              <p className="mt-4 text-base lp-text-muted">{c.pillars.subtitle}</p>
            </InView>
            <div className="lp-pillars__grid">
              {c.pillars.items.map((item, i) => (
                <InView key={item.title} as="article" className="lp-pillar-card" delay={i * 90}>
                  <span className="lp-pillar-card__icon" aria-hidden>
                    <LandingIcon name={item.icon} size="xl" />
                  </span>
                  <h3 className="lp-pillar-card__title">{item.title}</h3>
                  <p className="lp-pillar-card__body">{item.description}</p>
                </InView>
              ))}
            </div>
          </section>

          <section id="workflows" className="mx-auto mt-28 max-w-5xl scroll-mt-28 space-y-24">
            {c.workflows.map((flow, index) => {
              const bullets =
                flow.id === "sell"
                  ? [shopExamplePath, ...flow.bullets]
                  : [...flow.bullets];
              const description =
                flow.id === "sell"
                  ? `Publish products to a branded public store at ${shopExamplePath}. Send a link instead of typing prices in voice notes for the tenth time today.`
                  : flow.description;

              return (
              <InView
                key={flow.id}
                as="article"
                className={`grid items-center gap-10 md:grid-cols-2 ${
                  index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
                delay={80}
              >
                <div className="lp-workflow-copy">
                  <p className="lp-workflow-label">
                    <LandingIcon name={flow.icon} size="sm" />
                    {flow.step} {flow.label} →
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight lp-text md:text-3xl">
                    {flow.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed lp-text-muted md:text-base">
                    {description}
                  </p>
                  <ul className="lp-feature-list">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="lp-feature-list__item">
                        <span className="lp-feature-list__check" aria-hidden>
                          <svg viewBox="0 0 24 16" fill="none">
                            <path
                              d="M1.5 8.2l3.4 3.4L12.2 3"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8.2 8.2l3.4 3.4L19.8 3"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="lp-feature-list__text">{bullet}</span>
                      </li>
                    ))}
                  </ul>
            </div>
                <WorkflowVisual id={flow.id} />
              </InView>
              );
            })}
          </section>

          <section id="storefront" className="lp-shop-showcase mx-auto mt-28 max-w-5xl scroll-mt-28">
            <InView className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight lp-text md:text-4xl">
                {c.storefront.title}
            </h2>
              <p className="mt-4 text-base lp-text-muted">{c.storefront.body}</p>
              <ShopUrlPill />
            </InView>
            <InView className="mt-10" delay={80}>
              <StorefrontPreview />
            </InView>
          </section>

          <section id="faq" className="mx-auto mt-20 max-w-3xl scroll-mt-28">
            <InView className="mb-8 text-center">
              <h2 className="inline-flex items-center justify-center gap-2 text-2xl font-semibold lp-text">
                <LandingIcon name="help" />
                Questions before you sign up
              </h2>
            </InView>
            <div className="space-y-3">
              {c.faq.map((item, i) => (
                <InView key={item.question} delay={i * 60}>
                  <details className="group rounded-2xl border lp-border lp-panel lp-faq-item">
                    <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium lp-text marker:content-none">
                      <LandingIcon name="help" size="sm"/>
                      <span className="flex-1">{item.question}</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed lp-text-muted">{item.answer}</p>
                  </details>
                </InView>
              ))}
            </div>
          </section>

          <InView
            as="section"
            className="lp-offer mx-auto mt-24 max-w-3xl rounded-3xl border text-center lp-border"
            style={{ background: "var(--lp-cta-gradient)" }}
          >
            <h2 className="text-3xl font-semibold tracking-tight lp-text">{c.offer.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed lp-text-muted md:text-base">{c.offer.body}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <LandingAuthActions variant="cta" />
            </div>
            <p className="mt-6 text-sm lp-text-subtle">
              <Link href={c.offer.secondaryCtaHref} className="lp-link-accent underline transition">
                {c.offer.secondaryCta}
              </Link>
            </p>
          </InView>

          <InView as="section" id="about" className="mx-auto mt-20 max-w-2xl scroll-mt-28 text-center">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] lp-text-subtle">{c.about.title}</h2>
            <p className="mt-4 text-sm leading-relaxed lp-text-muted md:text-base">{c.about.body}</p>
          </InView>

          <InView as="section" id="contact" className="mx-auto mt-10 max-w-xl scroll-mt-28 text-center">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] lp-text-subtle">{c.contact.title}</h2>
            <p className="mt-3 text-sm lp-text-muted">{c.contact.body}</p>
            <a href={`mailto:${c.contact.email}`} className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-medium lp-accent hover:underline">
              <LandingIcon name="mail" size="sm" />
              {c.contact.email}
            </a>
          </InView>
        </main>

        <InView as="footer" className="mt-20 border-t pt-10 text-center text-sm lp-text-subtle lp-border">
          <p>{c.footer.tagline}</p>
          <p className="mt-2">© {new Date().getFullYear()} {c.brand.name}</p>
        </InView>
      </div>
    </div>
  );
}
