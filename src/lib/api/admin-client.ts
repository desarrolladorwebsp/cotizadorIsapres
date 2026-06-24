import type {
  PlanPdfUploadResult,
  UploadPlanPdfRequest,
} from "@/lib/plan-pdf-storage/types";
import type { Clinic } from "@/types/clinic";
import type { HealthPlan } from "@/types/plan";
import type { QuoteRecord } from "@/types/quote";
import type { IsapreRecord, UpdateIsapreGesInput } from "@/types/isapre";
import type {
  CreateStaffAccountInput,
  StaffAccountRecord,
  StaffRealm,
  UpdateStaffAccountInput,
} from "@/types/staff-account";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  let data: (T & { error?: string }) | null = null;

  try {
    data = (await response.json()) as T & { error?: string };
  } catch {
    if (!response.ok) {
      throw new Error(
        `Error en la solicitud (${response.status}). El servidor no respondió correctamente.`,
      );
    }
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!response.ok) {
    throw new Error(data?.error ?? `Error en la solicitud (${response.status}).`);
  }

  return data as T;
}

export async function fetchPlans(): Promise<HealthPlan[]> {
  const response = await fetch("/api/plans");
  return parseJsonResponse<HealthPlan[]>(response);
}

export async function createPlan(plan: HealthPlan): Promise<HealthPlan> {
  const response = await fetch("/api/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plan),
  });
  return parseJsonResponse<HealthPlan>(response);
}

export async function updatePlan(plan: HealthPlan): Promise<HealthPlan> {
  const response = await fetch(
    `/api/plans/${encodeURIComponent(plan.unique_code)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    },
  );
  return parseJsonResponse<HealthPlan>(response);
}

export async function deletePlan(uniqueCode: string): Promise<void> {
  const response = await fetch(
    `/api/plans/${encodeURIComponent(uniqueCode)}`,
    { method: "DELETE" },
  );
  await parseJsonResponse<{ ok: boolean }>(response);
}

export async function fetchClinics(): Promise<Clinic[]> {
  const response = await fetch("/api/clinics");
  return parseJsonResponse<Clinic[]>(response);
}

export async function fetchQuotes(): Promise<QuoteRecord[]> {
  const response = await fetch("/api/quotes");
  return parseJsonResponse<QuoteRecord[]>(response);
}

export async function fetchIsapres(): Promise<IsapreRecord[]> {
  const response = await fetch("/api/isapres");
  return parseJsonResponse<IsapreRecord[]>(response);
}

export async function updateIsapreGes(
  id: string,
  input: UpdateIsapreGesInput,
): Promise<{ isapre: IsapreRecord }> {
  const response = await fetch(`/api/isapres/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonResponse<{ isapre: IsapreRecord }>(response);
}

export async function fetchStaffAccounts(): Promise<StaffAccountRecord[]> {
  const response = await fetch("/api/admin/accounts");
  return parseJsonResponse<StaffAccountRecord[]>(response);
}

export async function createStaffAccount(
  input: CreateStaffAccountInput,
): Promise<{ account: StaffAccountRecord; message: string }> {
  const response = await fetch("/api/admin/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonResponse<{ account: StaffAccountRecord; message: string }>(
    response,
  );
}

export async function updateStaffAccount(
  realm: StaffRealm,
  id: string,
  input: UpdateStaffAccountInput,
): Promise<{ account: StaffAccountRecord }> {
  const response = await fetch(
    `/api/admin/accounts/${encodeURIComponent(id)}?realm=${realm}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return parseJsonResponse<{ account: StaffAccountRecord }>(response);
}

export async function resendStaffInvite(
  realm: StaffRealm,
  id: string,
): Promise<{ account: StaffAccountRecord; message: string }> {
  const response = await fetch(
    `/api/admin/accounts/${encodeURIComponent(id)}?realm=${realm}&action=resend-invite`,
    { method: "POST" },
  );
  return parseJsonResponse<{ account: StaffAccountRecord; message: string }>(
    response,
  );
}

export async function createClinic(clinic: Clinic): Promise<Clinic> {
  const response = await fetch("/api/clinics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clinic),
  });
  return parseJsonResponse<Clinic>(response);
}

export async function updateClinic(clinic: Clinic): Promise<Clinic> {
  const response = await fetch(
    `/api/clinics/${encodeURIComponent(clinic.id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clinic),
    },
  );
  return parseJsonResponse<Clinic>(response);
}

export async function deleteClinic(clinicId: string): Promise<void> {
  const response = await fetch(
    `/api/clinics/${encodeURIComponent(clinicId)}`,
    { method: "DELETE" },
  );
  await parseJsonResponse<{ ok: boolean }>(response);
}

export async function uploadPlanPdf(
  file: File,
  params: UploadPlanPdfRequest,
): Promise<PlanPdfUploadResult & { publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uniqueCode", params.uniqueCode);
  formData.append("isapre", params.isapre);

  if (params.previousStoragePath) {
    formData.append("previousStoragePath", params.previousStoragePath);
  }

  const response = await fetch("/api/plans/pdf", {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse<PlanPdfUploadResult & { publicId: string }>(response);
}

export function createEmptyPlan(): HealthPlan {
  return {
    isapre: "Consalud",
    plan_name: "",
    unique_code: "",
    base_price_uf: 1,
    ges_premium_uf: 0.731,
    has_top: false,
    additional_notes: null,
    pdf_url: null,
    pdf_public_id: null,
    zones: [],
    coverage: [],
  };
}

export function createEmptyClinic(): Clinic {
  return { id: "", name: "", zones: [] };
}
