"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage, isUnauthorizedError } from "../lib/api";
import { clearAuthToken } from "../lib/auth-token";
import { logout } from "../services/auth";
import { getProfile, type User } from "../services/users";
import DashboardLayout from "@/dashboard/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const current = await getProfile();
        if (cancelled) return;
        setUser(current);
      } catch (err) {
        if (cancelled) return;
        if (isUnauthorizedError(err)) {
          clearAuthToken();
          router.replace("/login");
          return;
        }
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      clearAuthToken();
    }
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        Loading your workspace...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-200">
        <p className="max-w-sm text-sm text-zinc-300">
          {error || "We couldn't load your workspace."}
        </p>
        <a
          href="/login"
          className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  return <DashboardLayout onLogout={handleLogout} />;
}
