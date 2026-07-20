"use client";

import AuthRedirectGate from "../components/AuthRedirectGate";
import { AuthScreen } from "../components/auth/AuthScreen";

export default function LoginPage() {
  return (
    <AuthRedirectGate>
      <AuthScreen initialMode="login" />
    </AuthRedirectGate>
  );
}
