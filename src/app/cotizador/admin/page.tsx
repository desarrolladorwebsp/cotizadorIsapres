"use client";

import { useCallback, useEffect, useState } from "react";
import { CotizadorNav } from "@/components/cotizador";
import { AdminShell, type AdminSection } from "@/components/admin/admin-shell";
import { AdminToast } from "@/components/admin/admin-toast";
import { ClinicsPanel } from "@/components/admin/clinics-panel";
import { PlansPanel } from "@/components/admin/plans-panel";
import {
  fetchClinics,
  fetchPlans,
} from "@/lib/api/admin-client";
import type { Clinic } from "@/types/clinic";
import type { HealthPlan } from "@/types/plan";

export default function CotizadorAdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("plans");
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingClinics, setLoadingClinics] = useState(true);
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

    try {
      const [nextPlans, nextClinics] = await Promise.all([
        fetchPlans(),
        fetchClinics(),
      ]);
      setPlans(nextPlans);
      setClinics(nextClinics);
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
    }
  }, [notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <>
      <CotizadorNav />
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
        ) : (
          <ClinicsPanel
            clinics={clinics}
            plans={plans}
            loading={loadingClinics}
            onRefresh={loadData}
            onNotify={notify}
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
