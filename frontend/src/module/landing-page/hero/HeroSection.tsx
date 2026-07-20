"use client";

import LandingAuthActions from "../LandingAuthActions";
import LandingIcon from "../LandingIcons";
import { landingPageContent as c } from "../content";
import { HeroPhone3D } from "../hero-phone-3d";
import "./hero-section.css";

export default function HeroSection() {
  return (
    <section className="lp-hero-split" aria-labelledby="hero-heading">
      <div className="lp-hero-split__content">
        <p className="lp-hero-split__eyebrow">{c.hero.eyebrow}</p>

        <h1 id="hero-heading" className="lp-hero-split__headline landing-headline">
          {c.hero.headline}
        </h1>

        <p className="lp-hero-split__sub">{c.hero.subheadline}</p>

        <div className="lp-hero-split__actions">
          <LandingAuthActions variant="hero" />
        </div>

        <div className="lp-hero-split__trust">
          {c.hero.trustBadges.map((badge) => (
            <span key={badge.label} className="lp-trust-badge">
              <LandingIcon name={badge.icon} size="sm" />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      <div className="lp-hero-split__visual">
        <HeroPhone3D />
      </div>
    </section>
  );
}
