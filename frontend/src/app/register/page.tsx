"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { getErrorMessage } from "../lib/api";
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
      await signup({
        ...form,
        passwordConfirmation: form.password
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign up with Google or use your email
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
                htmlFor="fullName"
                className="mb-1.5 block text-xs text-neutral-600"
              >
                Full name
              </label>
              <input
                id="fullName"
                autoComplete="name"
                className="w-full rounded-lg border-0 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-1 ring-transparent transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-300"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Your name"
              />
            </div>

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
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs text-neutral-600"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border-0 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-1 ring-transparent transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-300"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
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
              {submitting ? "Creating account…" : "Sign up"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 hover:underline"
          >
            Log in
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
