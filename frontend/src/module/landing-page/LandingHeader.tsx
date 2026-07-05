"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LandingAuthActions from "./LandingAuthActions";
import LandingThemeToggle from "./LandingThemeToggle";
import { landingPageContent as c } from "./content";
import type { LandingTheme } from "./theme";

type Props = {
  theme: LandingTheme;
  onToggleTheme: () => void;
};

export default function LandingHeader({ theme, onToggleTheme }: Props) {
  const [entered, setEntered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`landing-header ${entered ? "landing-header--entered" : ""} ${
        scrolled ? "landing-header--scrolled" : ""
      }`}
    >
      <div className="landing-header__inner">
        <Link href="/" className="landing-header__brand">
          <Image
            src="/icon.png"
            alt={c.brand.name}
            width={28}
            height={28}
            className="rounded-lg"
            priority
          />
          <span>{c.brand.name}</span>
        </Link>

        <nav className="landing-header__nav">
          <a href="#workflows">Product</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="landing-header__actions">
          <LandingThemeToggle theme={theme} onToggle={onToggleTheme} />
          <LandingAuthActions variant="header" />
        </div>
      </div>
    </header>
  );
}
