/** Normaliza RUT chileno a formato sin puntos (cuerpo-DV). */
export function normalizeRut(value: string): string {
  return value.replace(/\./g, "").replace(/\s/g, "").toUpperCase();
}

function computeRutCheckDigit(body: number): string {
  let sum = 0;
  let multiplier = 2;

  while (body > 0) {
    sum += (body % 10) * multiplier;
    body = Math.floor(body / 10);
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

/** Valida RUT chileno (formato flexible). */
export function isValidRut(value: string): boolean {
  const normalized = normalizeRut(value);
  const match = normalized.match(/^(\d{7,8})([0-9K])$/);
  if (!match) return false;

  const body = Number.parseInt(match[1], 10);
  const digit = match[2];
  return computeRutCheckDigit(body) === digit;
}

export function formatRut(value: string): string {
  const normalized = normalizeRut(value);
  const match = normalized.match(/^(\d{1,8})([0-9K])$/);
  if (!match) return normalized;

  const body = match[1];
  const digit = match[2];
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${digit}`;
}

export function rutMatches(expected: string | null | undefined, provided: string): boolean {
  if (!expected?.trim()) return true;
  return normalizeRut(expected) === normalizeRut(provided);
}

export function validateRutOrThrow(value: string, label = "RUT"): void {
  if (!value.trim()) {
    throw new Error(`El ${label} es obligatorio.`);
  }
  if (!isValidRut(value)) {
    throw new Error(`El ${label} no es válido.`);
  }
}
