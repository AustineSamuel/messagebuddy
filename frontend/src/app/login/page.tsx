"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { getErrorMessage } from "../lib/api";
import { login } from "../services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Sign in failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-neutral-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-xs font-bold text-white">
            MB
          </div>
          <h1 className="text-xl font-medium tracking-tight text-neutral-900">
            Log in to MessageBuddy
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your email and password to continue
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm">
          <GoogleSignInButton
            disabled={submitting}
            onSuccess={() => router.push("/dashboard")}
            onError={(m) => setError(m)}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-neutral-400">or</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs text-neutral-600"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border-0 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-1 ring-transparent transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs text-neutral-600"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border-0 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-1 ring-transparent transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-neutral-900 hover:underline"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
