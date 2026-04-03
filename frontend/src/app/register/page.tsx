"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signup(form);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10 md:px-10 lg:px-16">
        <div className="hidden flex-1 flex-col justify-between pr-8 md:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Create your workspace
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50">
              Set up MessageBuddy for your business in minutes.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300">
              Connect channels, invite teammates, and start replying smarter. Your
              account is ready as soon as you finish this step.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              No setup fees
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Cancel anytime
            </span>
          </div>
        </div>

        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 -top-6 translate-x-4 rounded-3xl bg-emerald-500/10 blur-3xl md:-top-10" />
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/70 p-7 shadow-2xl shadow-emerald-500/15 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Create account
                </p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-50">
                  Start your MessageBuddy workspace
                </h2>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/40">
                MB
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5 text-sm">
                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                  Full name
                </label>
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                  Work email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Creating your workspace..." : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-zinc-400">
              Already registered?{" "}
              <a
                href="/login"
                className="font-medium text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
              >
                Sign in instead
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

