"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CotizadorWorkspace } from "@/components/cotizador/cotizador-workspace";
import { ExecutiveToastStack } from "@/components/executive/executive-toast";
import { useExecutiveToast } from "@/hooks/use-executive-toast";
import { ClinicsPanel } from "@/components/admin/clinics-panel";
import { CompanyAgreementsPanel } from "@/components/admin/company-agreements-panel";
import { GesPanel } from "@/components/admin/ges-panel";
import { PlansAndPdfsAdminView } from "@/components/admin/plans-and-pdfs-admin-view";
import { UsersPanel } from "@/components/admin/users-panel";
import { ExecutiveAdminProspectsView } from "@/components/executive/admin/executive-admin-prospects-view";
import { ExecutiveClientsPanel } from "@/components/executive/executive-clients-panel";
import { ExecutiveCalendarPanel } from "@/components/executive/executive-calendar-panel";
import { ExecutiveClinicsMapPanel } from "@/components/executive/executive-clinics-map-panel";
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
  STAFF_SECTION_QUERY,
  staffSectionHref,
  type StaffSection,
} from "@/lib/staff/staff-sections";
import type { Clinic } from "@/types/clinic";
import type { HealthPlan } from "@/types/plan";

export function ExecutiveDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { allowedSections, loading: sessionLoading } = useStaffSession();

  const [section, setSection] = useState<ExecutiveSection>("inicio");
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const { toasts, notify, dismiss } = useExecutiveToast();

  const sectionSet = useMemo(
    () => new Set<StaffSection>(allowedSections),
    [allowedSections],
  );

  const canAccessSection = useCallback(
    (next: StaffSection) => sectionSet.has(next),
    [sectionSet],
  );

  useEffect(() => {
    if (sessionLoading || allowedSections.length === 0) return;

    const querySection = searchParams.get(STAFF_SECTION_QUERY);
    if (isStaffSection(querySection)) {
      if (!canAccessSection(querySection)) {
        setSection("inicio");
        router.replace(staffSectionHref("inicio"));
        return;
      }
      setSection(querySection);
      return;
    }

    if (!canAccessSection(section)) {
      setSection("inicio");
      router.replace(staffSectionHref("inicio"));
    }
  }, [
    searchParams,
    canAccessSection,
    router,
    sessionLoading,
    section,
    allowedSections.length,
  ]);

  const loadClinics = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const nextClinics = await fetchClinics();
      setClinics(nextClinics);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las clínicas.",
        "error",
      );
    } finally {
      setLoadingCatalog(false);
    }
  }, [notify]);

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
    if (
      (section === "clinicas" || section === "reportes-pdf") &&
      canAccessSection(section)
    ) {
      void loadCatalog();
      return;
    }
    if (section === "mapa" && canAccessSection("mapa")) {
      void loadClinics();
    }
  }, [section, canAccessSection, loadCatalog, loadClinics]);

  function handleSectionChange(next: ExecutiveSection) {
    if (!canAccessSection(next)) return;
    setSection(next);
    router.replace(staffSectionHref(next), { scroll: false });
  }

  return (
    <>
      <ExecutiveShell
        activeSection={section}
        onSectionChange={handleSectionChange}
        allowedSections={allowedSections}
      >
        {section === "inicio" && canAccessSection("inicio") ? (
          <ExecutiveDashboardHome />
        ) : null}

        {section === "calendario" && canAccessSection("calendario") ? (
          <ExecutiveCalendarPanel />
        ) : null}

        {section === "cotizador" && canAccessSection("cotizador") ? (
          <CotizadorWorkspace
            variant="executive"
            embeddedInExecutiveShell
            onNotify={notify}
          />
        ) : null}

        {section === "clientes" && canAccessSection("clientes") ? (
          <ExecutiveClientsPanel onNotify={notify} />
        ) : null}

        {section === "cotizaciones" && canAccessSection("cotizaciones") ? (
          <ExecutiveQuotesPanel onNotify={notify} />
        ) : null}

        {section === "mapa" && canAccessSection("mapa") ? (
          <ExecutiveClinicsMapPanel
            clinics={clinics}
            loading={loadingCatalog}
            onRefresh={loadClinics}
          />
        ) : null}

        {section === "prospectos" && canAccessSection("prospectos") ? (
          <ExecutiveAdminProspectsView onNotify={notify} embedded />
        ) : null}

        {section === "usuarios" && canAccessSection("usuarios") ? (
          <UsersPanel onNotify={notify} canManage />
        ) : null}

        {section === "clinicas" && canAccessSection("clinicas") ? (
          <ClinicsPanel
            clinics={clinics}
            plans={plans}
            loading={loadingCatalog}
            onRefresh={loadCatalog}
            onNotify={notify}
            canManage
          />
        ) : null}

        {section === "ges" && canAccessSection("ges") ? (
          <GesPanel onNotify={notify} canManage />
        ) : null}

        {section === "reportes-pdf" && canAccessSection("reportes-pdf") ? (
          <PlansAndPdfsAdminView
            plans={plans}
            clinics={clinics}
            loading={loadingCatalog}
            onRefresh={loadCatalog}
            onNotify={notify}
          />
        ) : null}

        {section === "convenios" && canAccessSection("convenios") ? (
          <CompanyAgreementsPanel onNotify={notify} />
        ) : null}
      </ExecutiveShell>

      <ExecutiveToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
