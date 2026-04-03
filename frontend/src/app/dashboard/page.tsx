"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../services/auth";
import { getProfile, type User } from "../services/users";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const current = await getProfile();
      if (!current) {
        router.replace("/login");
        return;
      }
      setUser(current);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">MessageBuddy</h1>
          <p className="text-sm text-zinc-500">
            Auto-reply bots for your business
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-700">
            {user?.businessName || "Your business"} — {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900">
          Welcome, {user?.contactName || "there"}
        </h2>
        <p className="mb-6 text-sm text-zinc-600">
          Here you&apos;ll later configure channels, connect WhatsApp or other
          platforms, and manage your auto-reply bots.
        </p>

        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
          Bots configuration coming soon. For now, your authentication is set up
          and working.
        </div>
      </main>
    </div>
  );
}

