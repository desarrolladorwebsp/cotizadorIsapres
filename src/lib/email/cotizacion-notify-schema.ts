import { z } from "zod";

const partnerEntityThemeSchema = z
  .object({
    primary: z.string().trim().min(1).optional(),
    primaryHover: z.string().trim().min(1).optional(),
    primaryDark: z.string().trim().min(1).optional(),
    primaryForeground: z.string().trim().min(1).optional(),
    secondary: z.string().trim().min(1).optional(),
    secondaryMuted: z.string().trim().min(1).optional(),
    bgLayout: z.string().trim().min(1).optional(),
    foreground: z.string().trim().min(1).optional(),
    muted: z.string().trim().min(1).optional(),
    border: z.string().trim().min(1).optional(),
    surfaceHover: z.string().trim().min(1).optional(),
    criteriaSurface: z.string().trim().min(1).optional(),
    criteriaRing: z.string().trim().min(1).optional(),
    accentWarning: z.string().trim().min(1).optional(),
    accentWarningForeground: z.string().trim().min(1).optional(),
  })
  .optional();

export const cotizacionNotifyPlanSchema = z.object({
  codigo: z.string().trim().min(1),
  id: z.string().trim().min(1),
  nombre: z.string().trim().min(1),
  isapre: z.string().trim().min(1),
  tipoPlan: z.string().trim().min(1).optional(),
  precioUf: z.string().trim().min(1),
  precioClp: z.string().trim().min(1),
  precioBaseUf: z.string().trim().min(1).optional(),
  gesPremiumUf: z.string().trim().min(1).optional(),
  tieneTop: z.boolean().optional(),
  coberturaHospitalaria: z.number().finite(),
  coberturaAmbulatoria: z.number().finite(),
  clinicas: z.number().int().min(0).optional(),
  notas: z.string().trim().optional(),
  pdfUrl: z.string().trim().min(1).optional(),
  totalBeneficiarios: z.number().int().min(1).optional(),
  factoresRiesgo: z.number().finite().optional(),
});

export const cotizacionNotifySolicitanteSchema = z.object({
  nombre: z.string().trim().min(1),
  rut: z.string().trim().min(1).optional(),
  telefono: z.string().trim().min(1).optional(),
  isapreActual: z.string().trim().min(1).optional(),
  notas: z.string().trim().optional(),
});

export const cotizacionNotifyInputSchema = z.object({
  email: z.string().trim().email(),
  region: z.string().trim().min(1),
  edad: z.number().int().min(0).max(120),
  sexo: z.string().trim().min(1).optional(),
  ingreso: z.string().trim().optional(),
  cargas: z.array(z.number().int().min(0).max(120)).optional(),
  busqueda: z.string().trim().optional(),
  orden: z.string().trim().optional(),
  moneda: z.enum(["clp", "uf"]).optional(),
  isapres: z.array(z.string().trim().min(1)).optional(),
  plan: cotizacionNotifyPlanSchema.optional(),
  solicitante: cotizacionNotifySolicitanteSchema.optional(),
  cotizadorUrl: z.string().trim().url(),
  partnerEntitySlug: z.string().trim().min(1).optional(),
  partnerEntityName: z.string().trim().min(1).optional(),
  partnerEntityTheme: partnerEntityThemeSchema,
  partnerEntityLogoUrl: z.string().trim().min(1).optional(),
});

export type CotizacionNotifyInput = z.infer<typeof cotizacionNotifyInputSchema>;
export type CotizacionNotifyPlan = z.infer<typeof cotizacionNotifyPlanSchema>;
export type CotizacionNotifySolicitante = z.infer<
  typeof cotizacionNotifySolicitanteSchema
>;

export function parseCotizacionNotifyInput(
  payload: unknown,
): CotizacionNotifyInput {
  const result = cotizacionNotifyInputSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ");
    throw new Error(message);
  }

  return result.data;
}
