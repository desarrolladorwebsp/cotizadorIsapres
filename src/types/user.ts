import type { ClientExecutiveProfile, ClientProfileInput } from "@/types/client-profile";
import type {
  ClientChecklist,
  ClientClosedRecord,
  ClientPipelineStatus,
} from "@/types/client-pipeline";
import type { ClientPlanSnapshot } from "@/types/client-plan";
import type { CotizadorSourceInfo } from "@/lib/partner-entity/source-label";

export type UserRole = "CLIENT" | "EXECUTIVE" | "ADMIN";
export type ClientOrigin = "COTIZADOR" | "MANUAL";

export interface CreateManualClientInput extends ClientProfileInput {
  pipelineNotes?: string | null;
  assignedExecutiveId?: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  rut: string | null;
  role: UserRole;
  active: boolean;
  assignedExecutiveId?: string | null;
  assignedExecutiveName?: string | null;
  pipelineStatus?: ClientPipelineStatus;
  checklist?: ClientChecklist;
  closedRecord?: ClientClosedRecord | null;
  pipelineNotes?: string | null;
  clientProfile?: ClientExecutiveProfile;
  requestedPlan?: ClientPlanSnapshot | null;
  advisedPlan?: ClientPlanSnapshot | null;
  clientOrigin?: ClientOrigin;
  cotizadorSource?: CotizadorSourceInfo | null;
  createdAt: string;
  updatedAt: string;
}
