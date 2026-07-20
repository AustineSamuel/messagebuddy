"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage } from "@/app/lib/api";
import { getAppInitials, getAppName } from "@/app/lib/app-name";
import { login, signup } from "@/app/services/auth";
import { GoogleSignInButton } from "../GoogleSignInButton";
import "./auth-screen.css";

export type AuthMode = "login" | "register";

type Props = {
  initialMode?: AuthMode;
};

const REASONS = [
  {
    title: "AI that replies while you sleep",
    body: "Set your tone and rules once — customers get answers even when you’re offline.",
  },
  {
    title: "One inbox for every WhatsApp sale",
    body: "Voice notes, price checks, and follow-ups in a dashboard built for sellers.",
  },
  {
    title: "Free to start — no card required",
    body: "5,000 credits on signup. Connect your number in minutes and keep closing.",
  },
] as const;

export function AuthScreen({ initialMode = "login" }: Props) {
  const router = useRouter();
  const appName = getAppName();
  const initials = getAppInitials(appName);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    const path = next === "register" ? "/register" : "/login";
    window.history.replaceState(null, "", path);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError("Passwords don’t match. Please try again.");
          return;
        }
        await signup({
          fullName,
          email,
          password,
          passwordConfirmation: confirmPassword,
        });
      } else {
        await login({ email, password });
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          isRegister
            ? "We couldn’t create your account. Please try again."
            : "We couldn’t sign you in. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__bg" aria-hidden>
        <span className="auth-screen__blob auth-screen__blob--1" />
        <span className="auth-screen__blob auth-screen__blob--2" />
        <span className="auth-screen__blob auth-screen__blob--3" />
        <span className="auth-screen__blob auth-screen__blob--4" />
      </div>

      <div className="auth-screen__shell">
        <aside className="auth-brand">
          <div className="auth-brand__logo">
            <span className="auth-brand__mark">{initials}</span>
            <span className="auth-brand__name">{appName}</span>
          </div>

          <h1 className="auth-brand__title">
            Why {appName} is the best place to run WhatsApp sales
          </h1>
          <p className="auth-brand__subtitle">
            Sign {isRegister ? "up" : "in"} to turn every chat into a closer —
            AI replies, voice transcription, and a storefront that works while
            you sell.
          </p>

          <ul className="auth-brand__reasons">
            {REASONS.map((reason) => (
              <li key={reason.title} className="auth-brand__reason">
                <span className="auth-brand__reason-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                    <path
                      d="M2.2 12.4l3.4 3.4 6.6-8.2"
                      stroke="#ffffff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.2 12.4l3.4 3.4 6.8-8.4"
                      stroke="#ffffff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="auth-brand__reason-copy">
                  <strong>{reason.title}</strong>
                  <p>{reason.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="auth-brand__footer">Free forever to start · Phone & desktop</p>
        </aside>

        <div className="auth-card">
          <header className="auth-card__header">
            <div className="auth-card__tabs" role="tablist" aria-label="Account">
              <button
                type="button"
                role="tab"
                aria-selected={isRegister}
                className={`auth-card__tab${isRegister ? " auth-card__tab--active" : ""}`}
                onClick={() => switchMode("register")}
              >
                Sign up
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isRegister}
                className={`auth-card__tab${!isRegister ? " auth-card__tab--active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Login
              </button>
            </div>

            <div className="auth-card__brand">
              <h2 className="auth-card__logo">{appName}</h2>
              <p className="auth-card__tagline">
                WhatsApp Business dashboard with AI that never sleeps.
              </p>
            </div>

            <div className="auth-card__avatar" aria-hidden>
              <UserIcon />
            </div>
          </header>

          <svg
            className="auth-card__wave"
            viewBox="0 0 500 42"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0,18 C80,42 160,0 250,18 C340,36 420,6 500,22 L500,42 L0,42 Z"
            />
          </svg>

          <div className="auth-card__body">
            <div className="auth-card__desktop-tabs" role="tablist" aria-label="Account">
              <button
                type="button"
                role="tab"
                aria-selected={isRegister}
                className={`auth-card__tab${isRegister ? " auth-card__tab--active" : ""}`}
                onClick={() => switchMode("register")}
              >
                Sign up
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isRegister}
                className={`auth-card__tab${!isRegister ? " auth-card__tab--active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Login
              </button>
            </div>

            <h2 className="auth-card__title">
              {isRegister ? "Create account" : "Sign in"}
            </h2>

            <div className="auth-google">
              <GoogleSignInButton
                disabled={submitting}
                onSuccess={() => router.push("/dashboard")}
                onError={(message) => setError(message)}
              />
            </div>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isRegister ? (
                <div className="auth-field">
                  <label htmlFor="auth-fullName">Full name</label>
                  <input
                    id="auth-fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              ) : null}

              <div className="auth-field">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  required
                />
              </div>

              {isRegister ? (
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label htmlFor="auth-password">Password</label>
                    <input
                      id="auth-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 chars"
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="auth-confirm">Confirm</label>
                    <input
                      id="auth-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Again"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="auth-field">
                  <label htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                  />
                </div>
              )}

              {error ? (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting
                  ? isRegister
                    ? "Creating…"
                    : "Signing in…"
                  : isRegister
                    ? "Sign up"
                    : "Continue"}
              </button>
            </form>

            <p className="auth-switch">
              {isRegister ? (
                <>
                  I have an account,{" "}
                  <button type="button" onClick={() => switchMode("login")}>
                    LOGIN
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button type="button" onClick={() => switchMode("register")}>
                    CREATE ACCOUNT
                  </button>
                </>
              )}
            </p>

            <Link href="/" className="auth-back">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19c1.5-3.2 4-4.8 6.5-4.8S17 15.8 18.5 19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
