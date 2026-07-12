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
