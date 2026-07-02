import { z } from "zod";

export const cotizacionNotifyPlanSchema = z.object({
  codigo: z.string().trim().min(1),
  id: z.string().trim().min(1),
  isapre: z.string().trim().min(1),
  precioUf: z.string().trim().min(1),
  precioClp: z.string().trim().min(1),
  coberturaHospitalaria: z.number().finite(),
  coberturaAmbulatoria: z.number().finite(),
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
  cotizadorUrl: z.string().trim().url(),
  partnerEntitySlug: z.string().trim().min(1).optional(),
  partnerEntityName: z.string().trim().min(1).optional(),
});

export type CotizacionNotifyInput = z.infer<typeof cotizacionNotifyInputSchema>;
export type CotizacionNotifyPlan = z.infer<typeof cotizacionNotifyPlanSchema>;

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
