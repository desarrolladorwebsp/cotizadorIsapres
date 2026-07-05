import { Suspense } from "react";
import {
  PremiumExecutiveAuthFallback,
  PremiumExecutiveShell,
} from "@/components/executive/premium-executive-shell";
import ExecutiveLoginClient from "./login-client";

export default function ExecutiveLoginPage() {
  return (
    <PremiumExecutiveShell variant="auth">
      <Suspense fallback={<PremiumExecutiveAuthFallback />}>
        <ExecutiveLoginClient />
      </Suspense>
    </PremiumExecutiveShell>
  );
}
