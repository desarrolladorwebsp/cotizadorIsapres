export type ClientPipelineStatus =
  | "NUEVO"
  | "CONTACTADO"
  | "EN_SEGUIMIENTO"
  | "PROPUESTA_ENVIADA"
  | "DOCUMENTACION"
  | "ENVIADO_ISAPRE"
  | "CERRADO"
  | "PERDIDO";

export interface ClientChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  checkedAt: string | null;
  category: "titular" | "cargas" | "isapre" | "general" | "documentos";
}

export interface ClientChecklist {
  items: ClientChecklistItem[];
  updatedAt: string;
}

export interface ClientClosedRecord {
  isapre: string;
  planCode?: string | null;
  planName?: string | null;
  closedAt: string;
  finalPriceUf?: string | null;
  finalPriceClp?: string | null;
  isapreReference?: string | null;
  notes?: string | null;
}

export interface UpdateClientPipelineInput {
  pipelineStatus?: ClientPipelineStatus;
  checklist?: ClientChecklist;
  closedRecord?: ClientClosedRecord | null;
  pipelineNotes?: string | null;
  clientProfile?: import("@/types/client-profile").ClientProfileInput;
}
