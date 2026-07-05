"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardPreview from "./DashboardPreview";
import InView from "./InView";
import LandingAuthActions from "./LandingAuthActions";
import LandingHeader from "./LandingHeader";
import LandingIcon from "./LandingIcons";
import { landingPageContent as c } from "./content";
import { getStoredLandingTheme, storeLandingTheme, type LandingTheme } from "./theme";
import "./landing-page.css";

function WorkflowVisual({ id }: { id: string }) {
  if (id === "automate") {
    return (
      <div className="lp-panel rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider lp-accent">
          <LandingIcon name="bot" size="sm" />
          Auto-reply active
        </div>
        <div className="space-y-2 text-xs lp-text-muted">
          <p className="rounded-lg px-3 py-2 lp-panel-inset">Customer: &quot;How much for delivery?&quot;</p>
          <p className="rounded-lg px-3 py-2 lp-ai-chip">
            MessageBuddy: &quot;Delivery to your area is ₦2,500. Share your address to confirm.&quot;
          </p>
        </div>
      </div>
    );
  }

  if (id === "sell") {
    return (
      <div className="lp-panel rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="lp-icon-box lp-icon-box--md">
            <LandingIcon name="shop" />
          </span>
          <div>
            <p className="text-sm font-medium lp-text">Obi Electronics</p>
            <p className="text-[11px] lp-text-subtle">yourstore.com/obi-electronics</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["iPhone 13", "AirPods Pro", "MacBook Air", "Samsung A54"].map((item) => (
            <div key={item} className="rounded-lg border p-3 lp-border lp-panel-inset">
              <div className="mb-2 h-12 rounded-md lp-panel-inset" />
              <p className="text-[11px] font-medium lp-text">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "grow") {
    return (
      <div className="lp-panel rounded-2xl p-5">
        <div className="mb-4 flex items-end justify-between gap-2">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="lp-chart-bar w-full rounded-t" style={{ height: `${h}px` }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] lp-text-subtle">
          <span>Messages sent</span>
          <span className="lp-accent">+24% this week</span>
        </div>
      </div>
    );
  }

  return <DashboardPreview />;
}

export default function LandingPage() {
  const [theme, setTheme] = useState<LandingTheme>("dark");

  useEffect(() => {
    setTheme(getStoredLandingTheme());

    document.documentElement.classList.add("landing-active");
    document.querySelectorAll('link[href="/dashboard.css"]').forEach((el) => el.remove());
    document.body.style.overflow = "";
    document.body.style.height = "";
    document.documentElement.style.overflow = "";

    return () => {
      document.documentElement.classList.remove("landing-active");
    };
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      storeLandingTheme(next);
      return next;
    });
  }

  return (
    <div className="landing-page relative min-h-screen w-full flex-1" data-theme={theme}>
      <div className="landing-page__shell relative z-10">
        <LandingHeader theme={theme} onToggleTheme={toggleTheme} />

        <main>
          <InView className="lp-hero-apple mx-auto w-full max-w-4xl text-center">
            <p className="lp-hero-eyebrow mb-6 inline-flex items-center justify-center gap-2 text-sm font-medium">
              <LandingIcon name={c.hero.eyebrowIcon} size="sm" />
              {c.hero.eyebrow}
            </p>
            <h1 className="lp-hero-headline text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-[4.5rem]">
              {c.hero.headline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed lp-text-muted md:text-lg">
              {c.hero.subheadline}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <LandingAuthActions variant="hero" />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {c.hero.trustBadges.map((badge) => (
                <span key={badge.label} className="lp-trust-badge">
                  <LandingIcon name={badge.icon} size="sm" />
                  {badge.label}
                </span>
              ))}
            </div>
          </InView>

          <InView className="mx-auto mt-14 w-full max-w-5xl md:mt-20" delay={120}>
            <DashboardPreview />
          </InView>

          <section className="mx-auto mt-24 max-w-5xl">
            <InView className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight lp-text md:text-4xl">{c.pillars.title}</h2>
              <p className="mt-4 text-base lp-text-muted">{c.pillars.subtitle}</p>
            </InView>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {c.pillars.items.map((item, i) => (
                <InView key={item.title} as="article" className="lp-panel rounded-2xl p-6" delay={i * 90}>
                  <span className="lp-section-icon">
                    <LandingIcon name={item.icon} />
                  </span>
                  <p className="text-[11px] font-medium uppercase tracking-wider lp-text-subtle">{item.label}</p>
                  <h3 className="mt-3 text-lg font-semibold lp-text">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed lp-text-muted">{item.description}</p>
                </InView>
              ))}
            </div>
          </section>

          <section id="workflows" className="mx-auto mt-28 max-w-5xl scroll-mt-28 space-y-24">
            {c.workflows.map((flow, index) => (
              <InView
                key={flow.id}
                as="article"
                className={`grid items-center gap-10 md:grid-cols-2 ${
                  index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
                delay={80}
              >
                <div>
                  <p className="lp-workflow-label">
                    <LandingIcon name={flow.icon} size="sm" />
                    {flow.step} {flow.label} →
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight lp-text md:text-3xl">
                    {flow.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed lp-text-muted md:text-base">
                    {flow.description}
                  </p>
                  <ul className="mt-6 space-y-2">
                    {flow.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2.5 text-sm lp-text-muted">
                        <span className="lp-bullet">
                          <LandingIcon name="check" size="sm" />
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <WorkflowVisual id={flow.id} />
              </InView>
            ))}
          </section>

          <InView
            as="section"
            className="mx-auto mt-28 max-w-5xl rounded-3xl border px-6 py-12 md:px-10 lp-border lp-panel"
          >
            <h2 className="text-center text-2xl font-semibold lp-text md:text-3xl">{c.problems.title}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed lp-text-muted md:text-base">
              {c.problems.intro}
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {c.problems.items.map((item, i) => (
                <InView key={item.title} as="article" className="lp-surface rounded-2xl border p-5" delay={i * 70}>
                  <span className="lp-section-icon">
                    <LandingIcon name={item.icon} />
                  </span>
                  <h3 className="text-base font-semibold lp-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed lp-text-muted">{item.description}</p>
                </InView>
              ))}
            </div>
          </InView>

          <InView className="mx-auto mt-20 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold lp-text md:text-3xl">{c.solution.title}</h2>
            <p className="mt-5 text-sm leading-relaxed lp-text-muted md:text-base">{c.solution.body}</p>
            <p
              className="mt-6 rounded-2xl border px-5 py-4 text-sm font-medium"
              style={{
                background: "var(--lp-highlight-bg)",
                borderColor: "var(--lp-highlight-border)",
                color: "var(--lp-highlight-text)",
              }}
            >
              {c.solution.highlight}
            </p>
          </InView>

          <section id="features" className="mx-auto mt-24 max-w-5xl scroll-mt-28">
            <InView className="text-center">
              <h2 className="text-2xl font-semibold lp-text md:text-3xl">{c.features.title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm lp-text-muted md:text-base">{c.features.subtitle}</p>
            </InView>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.features.items.map((feature, i) => (
                <InView key={feature.title} as="article" className="lp-panel rounded-2xl p-5" delay={(i % 3) * 80}>
                  <span className="lp-section-icon">
                    <LandingIcon name={feature.icon} />
                  </span>
                  <h3 className="text-base font-semibold lp-text">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed lp-text-muted">{feature.description}</p>
                  <p className="lp-benefit mt-3">
                    <LandingIcon name="check" size="sm" />
                    {feature.benefit}
                  </p>
                </InView>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="mx-auto mt-24 max-w-4xl scroll-mt-28">
            <InView className="text-center">
              <h2 className="text-2xl font-semibold lp-text md:text-3xl">{c.howItWorks.title}</h2>
            </InView>
            <ol className="mt-10 space-y-4">
              {c.howItWorks.steps.map((step, i) => (
                <InView key={step.step} as="li" className="flex gap-5 rounded-2xl border p-5 lp-border lp-surface" delay={i * 90}>
                  <span className="lp-icon-box lp-icon-box--md shrink-0">
                    <LandingIcon name={step.icon} />
                  </span>
                  <div>
                    <p className="text-[11px] font-mono font-semibold lp-accent">{step.step}</p>
                    <h3 className="mt-1 text-base font-semibold lp-text">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed lp-text-muted">{step.description}</p>
                  </div>
                </InView>
              ))}
            </ol>
            <InView className="mt-6 text-center text-sm lp-text-subtle">
              {c.howItWorks.reassurance}
            </InView>
          </section>

          <InView
            as="section"
            className="mx-auto mt-20 max-w-3xl rounded-3xl border px-6 py-10 text-center md:px-10 lp-border lp-panel"
          >
            <h2 className="inline-flex items-center justify-center gap-2 text-xl font-semibold lp-text md:text-2xl">
              <LandingIcon name="globe" />
              {c.audience.title}
            </h2>
            <ul className="lp-audience-list">
              {c.audience.items.map((item, i) => (
                <InView key={item} as="li" className="lp-audience-item" delay={i * 50}>
                  <span className="lp-audience-item__icon" aria-hidden>
                    <LandingIcon name="check" size="sm" />
                  </span>
                  <span className="lp-audience-item__text">{item}</span>
                </InView>
              ))}
            </ul>
          </InView>

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
                  <details className="group rounded-2xl border px-5 py-4 lp-border lp-panel">
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
            className="mx-auto mt-24 max-w-3xl rounded-3xl border px-6 py-14 text-center md:px-12 lp-border"
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
