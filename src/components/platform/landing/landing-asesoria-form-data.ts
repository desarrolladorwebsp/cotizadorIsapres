/** Opciones del formulario de solicitud de asesoría (landing Cotizador Premium). */

export const ASESORIA_STEPS = [
  { id: 1, label: "Datos personales", shortLabel: "Datos\npersonales" },
  { id: 2, label: "Datos para cotizar", shortLabel: "Datos para\ncotizar" },
  { id: 3, label: "Solicitar asesoría", shortLabel: "Solicitar\nasesoría" },
] as const;

export const PREVISION_OPTIONS = [
  { value: "", label: "Seleccione…" },
  { value: "fonasa", label: "Fonasa" },
  { value: "banmedica", label: "Isapre Banmédica" },
  { value: "consalud", label: "Isapre Consalud" },
  { value: "colmena", label: "Isapre Colmena" },
  { value: "cruz-blanca", label: "Isapre Cruz Blanca" },
  { value: "nueva-mas-vida", label: "Isapre Nueva más Vida" },
  { value: "vida-tres", label: "Isapre Vida Tres" },
  { value: "otra", label: "Otra" },
  { value: "sin-prevision", label: "Sin previsión" },
] as const;

export const REGIONES_CHILE = [
  { value: "", label: "Seleccione…" },
  { value: "arica-parinacota", label: "Región de Arica y Parinacota" },
  { value: "tarapaca", label: "Región de Tarapacá" },
  { value: "antofagasta", label: "Región de Antofagasta" },
  { value: "atacama", label: "Región de Atacama" },
  { value: "coquimbo", label: "Región de Coquimbo" },
  { value: "valparaiso", label: "Región de Valparaíso" },
  { value: "ohiggins", label: "Región de O'Higgins" },
  { value: "maule", label: "Región del Maule" },
  { value: "nuble", label: "Región del Ñuble" },
  { value: "biobio", label: "Región del Biobío" },
  { value: "araucania", label: "Región de La Araucanía" },
  { value: "los-rios", label: "Región de Los Ríos" },
  { value: "los-lagos", label: "Región de Los Lagos" },
  { value: "aysen", label: "Región de Aysén" },
  { value: "magallanes", label: "Región de Magallanes" },
  { value: "metropolitana", label: "Región Metropolitana" },
] as const;

export const CARGAS_MEDICAS_OPTIONS = [
  { value: "", label: "Seleccione…" },
  { value: "sin-cargas", label: "Sin cargas" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5-o-mas", label: "5 o más" },
] as const;

export const MOTIVO_OPTIONS = [
  { value: "", label: "Seleccione…" },
  {
    value: "aumento-excesivo",
    label: "Aumento excesivo en el valor del plan",
  },
  {
    value: "mejores-coberturas",
    label: "Mejores coberturas en otra isapre",
  },
  {
    value: "malas-experiencias",
    label: "Malas experiencias con el servicio al cliente",
  },
  {
    value: "recomendacion",
    label: "Recomendación médica o familiar",
  },
  {
    value: "sumar-cargas",
    label: "Necesidad de sumar cargas familiares",
  },
] as const;

export const CONTACTO_OPTIONS = [
  { value: "", label: "Seleccione…" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telefono", label: "Teléfono" },
  { value: "email", label: "Email" },
  { value: "video-llamada", label: "Video llamada" },
] as const;

export type AsesoriaFormData = {
  nombreCompleto: string;
  rut: string;
  edad: string;
  correo: string;
  celular: string;
  previsionActual: string;
  ufActual: string;
  regionResidencia: string;
  cargas: string;
  edadCargas: string;
  rentaImponible: string;
  motivo: string;
  preferenciaContacto: string;
  autorizaDatos: boolean;
  /** Honeypot anti-bot */
  website: string;
};

export const INITIAL_ASESORIA_FORM: AsesoriaFormData = {
  nombreCompleto: "",
  rut: "",
  edad: "",
  correo: "",
  celular: "",
  previsionActual: "",
  ufActual: "",
  regionResidencia: "",
  cargas: "",
  edadCargas: "",
  rentaImponible: "",
  motivo: "",
  preferenciaContacto: "",
  autorizaDatos: false,
  website: "",
};

export type AsesoriaFieldErrors = Partial<
  Record<keyof AsesoriaFormData, string>
>;

export function formatRutInput(value: string): string {
  const cleaned = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}

export function validateAsesoriaStep(
  step: number,
  data: AsesoriaFormData,
): AsesoriaFieldErrors {
  const errors: AsesoriaFieldErrors = {};

  if (step === 1) {
    if (data.nombreCompleto.trim().length < 2) {
      errors.nombreCompleto = "Ingresa nombre y apellido";
    }
    if (!data.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
      errors.correo = "Ingresa un email válido";
    }
    if (data.celular.replace(/\D/g, "").length < 8) {
      errors.celular = "Ingresa un teléfono válido";
    }
  }

  if (step === 2) {
    if (!data.previsionActual) {
      errors.previsionActual = "Selecciona tu previsión actual";
    }
    if (!data.regionResidencia) {
      errors.regionResidencia = "Selecciona tu región";
    }
    if (!data.cargas) {
      errors.cargas = "Selecciona las cargas médicas";
    }
    if (!data.rentaImponible.trim()) {
      errors.rentaImponible = "Indica tu renta imponible aproximada";
    }
  }

  if (step === 3) {
    if (!data.preferenciaContacto) {
      errors.preferenciaContacto = "Selecciona cómo prefieres que te contactemos";
    }
    if (!data.autorizaDatos) {
      errors.autorizaDatos = "Debes autorizar el tratamiento de tus datos";
    }
  }

  return errors;
}
