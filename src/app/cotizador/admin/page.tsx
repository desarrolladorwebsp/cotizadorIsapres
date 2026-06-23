"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell, type AdminSection } from "@/components/admin/admin-shell";
import { AdminToast } from "@/components/admin/admin-toast";
import { ClinicsPanel } from "@/components/admin/clinics-panel";
import { GesPanel } from "@/components/admin/ges-panel";
import { PlansPanel } from "@/components/admin/plans-panel";
import { QuotesPanel } from "@/components/admin/quotes-panel";
import {
  fetchClinics,
  fetchPlans,
  fetchQuotes,
} from "@/lib/api/admin-client";
import type { Clinic } from "@/types/clinic";
import type { HealthPlan } from "@/types/plan";
import type { QuoteRecord } from "@/types/quote";

export default function CotizadorAdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("quotes");
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setToastTone(tone);
      setToastMessage(message);
    },
    [],
  );

  const loadData = useCallback(async () => {
    setLoadingPlans(true);
    setLoadingClinics(true);
    setLoadingQuotes(true);

    try {
      const [nextPlans, nextClinics, nextQuotes] = await Promise.all([
        fetchPlans(),
        fetchClinics(),
        fetchQuotes(),
      ]);
      setPlans(nextPlans);
      setClinics(nextClinics);
      setQuotes(nextQuotes);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos administrativos.",
        "error",
      );
    } finally {
      setLoadingPlans(false);
      setLoadingClinics(false);
      setLoadingQuotes(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <>
      <AdminShell
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {activeSection === "plans" ? (
          <PlansPanel
            plans={plans}
            clinics={clinics}
            loading={loadingPlans}
            onRefresh={loadData}
            onNotify={notify}
          />
        ) : activeSection === "clinics" ? (
          <ClinicsPanel
            clinics={clinics}
            plans={plans}
            loading={loadingClinics}
            onRefresh={loadData}
            onNotify={notify}
          />
        ) : activeSection === "ges" ? (
          <GesPanel onNotify={notify} />
        ) : (
          <QuotesPanel
            quotes={quotes}
            loading={loadingQuotes}
            onRefresh={loadData}
          />
        )}
      </AdminShell>

      <AdminToast
        message={toastMessage}
        tone={toastTone}
        onDismiss={() => setToastMessage(null)}
      />
    </>
  );
}
