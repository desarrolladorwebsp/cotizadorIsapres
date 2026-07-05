import { PremiumExecutiveShell } from "@/components/executive/premium-executive-shell";
import { ExecutiveDashboard } from "@/components/executive/executive-dashboard";

export default function CotizadorExecutivesPage() {
  return (
    <PremiumExecutiveShell variant="dashboard">
      <ExecutiveDashboard />
    </PremiumExecutiveShell>
  );
}
