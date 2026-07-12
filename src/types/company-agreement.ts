export interface CompanyAgreementRecord {
  id: string;
  companyRut: string;
  companyRutRaw: string | null;
  companyName: string;
  discountPercent: number | null;
}

export interface CompanyAgreementLookupResult {
  matches: CompanyAgreementRecord[];
}

/** Convenio empresa confirmado en la sesión del cotizador (lookup exitoso). */
export interface ValidatedCompanyAgreement {
  companyRut: string;
  companyRutRaw: string | null;
  companyName: string;
  discountPercent: number | null;
}
