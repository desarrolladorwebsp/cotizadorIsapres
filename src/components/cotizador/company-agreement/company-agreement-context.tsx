"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ValidatedCompanyAgreement } from "@/types/company-agreement";

interface CompanyAgreementContextValue {
  validatedAgreement: ValidatedCompanyAgreement | null;
  setValidatedAgreement: (agreement: ValidatedCompanyAgreement | null) => void;
  clearValidatedAgreement: () => void;
}

const CompanyAgreementContext =
  createContext<CompanyAgreementContextValue | null>(null);

export function CompanyAgreementProvider({ children }: { children: ReactNode }) {
  const [validatedAgreement, setValidatedAgreementState] =
    useState<ValidatedCompanyAgreement | null>(null);

  const setValidatedAgreement = useCallback(
    (agreement: ValidatedCompanyAgreement | null) => {
      setValidatedAgreementState(agreement);
    },
    [],
  );

  const clearValidatedAgreement = useCallback(() => {
    setValidatedAgreementState(null);
  }, []);

  const value = useMemo(
    () => ({
      validatedAgreement,
      setValidatedAgreement,
      clearValidatedAgreement,
    }),
    [validatedAgreement, setValidatedAgreement, clearValidatedAgreement],
  );

  return (
    <CompanyAgreementContext.Provider value={value}>
      {children}
    </CompanyAgreementContext.Provider>
  );
}

export function useCompanyAgreementContext(): CompanyAgreementContextValue {
  const context = useContext(CompanyAgreementContext);
  if (!context) {
    throw new Error(
      "useCompanyAgreementContext debe usarse dentro de CompanyAgreementProvider.",
    );
  }
  return context;
}

/** Permite usar el contexto cuando el provider es opcional (p. ej. panel ejecutivo). */
export function useOptionalCompanyAgreementContext():
  | CompanyAgreementContextValue
  | null {
  return useContext(CompanyAgreementContext);
}
