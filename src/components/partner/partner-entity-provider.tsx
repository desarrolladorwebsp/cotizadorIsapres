"use client";

import { createContext, useContext, useMemo } from "react";
import { partnerThemeToCssProperties } from "@/lib/partner-entity/theme";
import type { PartnerEntityPublic } from "@/types/partner-entity";

interface PartnerEntityContextValue {
  entity: PartnerEntityPublic | null;
  isBranded: boolean;
  themeStyle: React.CSSProperties;
}

const PartnerEntityContext = createContext<PartnerEntityContextValue>({
  entity: null,
  isBranded: false,
  themeStyle: {},
});

export interface PartnerEntityProviderProps {
  entity: PartnerEntityPublic | null;
  children: React.ReactNode;
}

export function PartnerEntityProvider({
  entity,
  children,
}: PartnerEntityProviderProps) {
  const value = useMemo<PartnerEntityContextValue>(
    () => ({
      entity,
      isBranded: Boolean(entity),
      themeStyle: entity ? partnerThemeToCssProperties(entity.theme) : {},
    }),
    [entity],
  );

  return (
    <PartnerEntityContext.Provider value={value}>
      {children}
    </PartnerEntityContext.Provider>
  );
}

export function usePartnerEntity(): PartnerEntityContextValue {
  return useContext(PartnerEntityContext);
}
