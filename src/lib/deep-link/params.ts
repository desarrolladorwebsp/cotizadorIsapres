/** Nombres de query params para deep linking del cotizador público. */
export const DEEP_LINK_PARAMS = {
  entidad: "entidad",
  region: "region",
  edad: "edad",
  sexo: "sexo",
  ingreso: "ingreso",
  cargas: "cargas",
  q: "q",
  precioMin: "precioMin",
  precioMax: "precioMax",
  isapres: "isapres",
  zonas: "zonas",
  tipoPlan: "tipoPlan",
  coberturaH: "coberturaH",
  coberturaA: "coberturaA",
  orden: "orden",
  moneda: "moneda",
  auto: "auto",
  email: "email",
} as const;

export const VALID_REGIONS = new Set([
  "rm",
  "arica",
  "tarapaca",
  "antofagasta",
  "atacama",
  "coquimbo",
  "valparaiso",
  "ohiggins",
  "maule",
  "nuble",
  "biobio",
  "araucania",
  "los_rios",
  "los_lagos",
  "aysen",
  "magallanes",
]);

export const VALID_SEX_VALUES = new Set(["m", "f"]);

export const VALID_SORT_KEYS = new Set([
  "price_asc",
  "price_desc",
  "coverage",
]);

export const VALID_CURRENCY = new Set(["clp", "uf"]);

/** Params que no deben persistirse al limpiar la URL tras hidratar. */
export const DEEP_LINK_BOOTSTRAP_PARAMS = new Set([
  DEEP_LINK_PARAMS.entidad,
  DEEP_LINK_PARAMS.auto,
]);
