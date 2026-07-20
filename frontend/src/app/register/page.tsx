"use client";

import AuthRedirectGate from "../components/AuthRedirectGate";
import { AuthScreen } from "../components/auth/AuthScreen";

export default function RegisterPage() {
  return (
    <AuthRedirectGate>
      <AuthScreen initialMode="register" />
    </AuthRedirectGate>
  );
}
