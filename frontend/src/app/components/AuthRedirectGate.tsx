"use client";

import { useRedirectIfAuthenticated } from "../hooks/useRedirectIfAuthenticated";

export default function AuthRedirectGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const checking = useRedirectIfAuthenticated("/dashboard");

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090a] text-zinc-400">
        <p className="text-sm">Checking your session…</p>
      </div>
    );
  }

  return children;
}
