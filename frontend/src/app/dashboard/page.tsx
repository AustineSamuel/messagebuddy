"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../services/auth";
import { getProfile, type User } from "../services/users";
import DashboardLayout from "@/dashboard/components/dashboard/DashboardLayout";

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
    <DashboardLayout onLogout={handleLogout} />
  );
}

