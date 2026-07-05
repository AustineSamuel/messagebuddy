"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isUnauthorizedError } from "../lib/api";
import { clearAuthToken, getAuthToken } from "../lib/auth-token";
import { getProfile } from "../services/users";

export function useRedirectIfAuthenticated(redirectTo = "/dashboard") {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        await getProfile();
        if (!cancelled) router.replace(redirectTo);
      } catch (err) {
        if (isUnauthorizedError(err)) {
          clearAuthToken();
        }
        if (!cancelled) setChecking(false);
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [router, redirectTo]);

  return checking;
}
