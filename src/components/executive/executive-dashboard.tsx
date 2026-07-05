"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CotizadorWorkspace } from "@/components/cotizador/cotizador-workspace";
import { AdminToast } from "@/components/admin/admin-toast";
import { ClinicsPanel } from "@/components/admin/clinics-panel";
import { GesPanel } from "@/components/admin/ges-panel";
import { UsersPanel } from "@/components/admin/users-panel";
import { ExecutiveAdminProspectsView } from "@/components/executive/admin/executive-admin-prospects-view";
import { ExecutiveClientsPanel } from "@/components/executive/executive-clients-panel";
import { ExecutiveDashboardHome } from "@/components/executive/executive-dashboard-home";
import { ExecutiveQuotesPanel } from "@/components/executive/executive-quotes-panel";
import {
  ExecutiveShell,
  type ExecutiveSection,
} from "@/components/executive/executive-shell";
import { useStaffSession } from "@/hooks/use-auth-session";
import {
  fetchClinics,
  fetchPlans,
} from "@/lib/api/admin-client";
import {
  isStaffSection,
  STAFF_ADMIN_SECTIONS,
  STAFF_SECTION_QUERY,
  staffSectionHref,
} from "@/lib/staff/staff-sections";
import type { Clinic } from "@/types/clinic";
import type { HealthPlan } from "@/types/plan";

export function ExecutiveDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useStaffSession();

  const [section, setSection] = useState<ExecutiveSection>("inicio");
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tone?: "success" | "error";
  } | null>(null);

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setToast({ message, tone });
    },
    [],
  );

  useEffect(() => {
    const querySection = searchParams.get(STAFF_SECTION_QUERY);
    if (isStaffSection(querySection)) {
      if (STAFF_ADMIN_SECTIONS.includes(querySection) && !isAdmin) {
        setSection("inicio");
        router.replace(staffSectionHref("inicio"));
        return;
      }
      setSection(querySection);
    }
  }, [searchParams, isAdmin, router]);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
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
          : "No se pudo cargar el catálogo.",
        "error",
      );
    } finally {
      setLoadingCatalog(false);
    }
  }, [notify]);

  useEffect(() => {
    if (section === "clinicas" && isAdmin) {
      void loadCatalog();
    }
  }, [section, isAdmin, loadCatalog]);

  function handleSectionChange(next: ExecutiveSection) {
    if (STAFF_ADMIN_SECTIONS.includes(next) && !isAdmin) return;
    setSection(next);
    router.replace(staffSectionHref(next), { scroll: false });
  }

  return (
    <>
      <ExecutiveShell
        activeSection={section}
        onSectionChange={handleSectionChange}
        hasAdminAccess={isAdmin}
      >
        {section === "inicio" ? (
          <ExecutiveDashboardHome
            hasAdminAccess={isAdmin}
            onNavigate={handleSectionChange}
          />
        ) : null}

        {section === "cotizador" ? (
          <CotizadorWorkspace variant="executive" embeddedInExecutiveShell />
        ) : null}

        {section === "clientes" ? (
          <ExecutiveClientsPanel onNotify={notify} />
        ) : null}

        {section === "cotizaciones" ? (
          <ExecutiveQuotesPanel onNotify={notify} />
        ) : null}

        {section === "prospectos" && isAdmin ? (
          <ExecutiveAdminProspectsView onNotify={notify} embedded />
        ) : null}

        {section === "usuarios" && isAdmin ? (
          <UsersPanel onNotify={notify} executivesOnly canManage />
        ) : null}

        {section === "clinicas" && isAdmin ? (
          <ClinicsPanel
            clinics={clinics}
            plans={plans}
            loading={loadingCatalog}
            onRefresh={loadCatalog}
            onNotify={notify}
            canManage
          />
        ) : null}

        {section === "ges" && isAdmin ? (
          <GesPanel onNotify={notify} canManage />
        ) : null}
      </ExecutiveShell>

      <AdminToast
        message={toast?.message ?? null}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
