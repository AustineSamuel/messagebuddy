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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200">
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/40">
            MB
          </span>
          <div>
            <h1 className="text-sm font-semibold text-zinc-50">MessageBuddy</h1>
            <p className="text-xs text-zinc-400">
              Auto-reply intelligence for your conversations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-300">
            <div className="font-medium">
              {user?.businessName || "Your business"}
            </div>
            <div className="text-zinc-500">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 md:flex-row md:items-start">
        <section className="flex-1">
          <h2 className="mb-1 text-xl font-semibold text-zinc-50">
            Welcome, {user?.contactName || "there"}
          </h2>
          <p className="mb-6 text-sm text-zinc-400">
            This is your starting point to connect channels, configure smart
            replies, and see how MessageBuddy is performing for your business.
          </p>

          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/70 p-6 text-sm text-zinc-300">
              <h3 className="mb-2 text-sm font-semibold text-zinc-50">
                Bots configuration coming soon
              </h3>
              <p className="text-sm text-zinc-400">
                For now, your authentication is set up and working. Soon you&apos;ll
                be able to connect WhatsApp, Instagram, and other channels,
                design flows, and track performance in real time.
              </p>
            </div>
          </div>
        </section>

        <aside className="mt-4 w-full max-w-xs space-y-4 md:mt-0">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-xs text-zinc-300">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Workspace status
            </p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Authentication
              </span>
              <span className="text-emerald-300">Active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-xs text-zinc-300">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Next steps
            </p>
            <ul className="space-y-1.5 text-zinc-400">
              <li>Decide which channels you want to connect first.</li>
              <li>List common questions your customers ask.</li>
              <li>Plan your ideal auto-reply tone and style.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

