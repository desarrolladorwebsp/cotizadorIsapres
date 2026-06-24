import {
  PLAN_TYPE_FILTER_DEFAULT_IDS,
  PLAN_TYPE_FILTER_OPTIONS,
  ZONE_FILTER_OPTIONS,
} from "@/lib/filter-options";
import { FILTER_HELP } from "@/lib/filter-help-content";
import { PUBLIC_API_VERSION } from "@/lib/public-api/constants";
import type { ZoneId } from "@/types/zone";

export type ZoneFilterGroup = "rm_sector" | "rm_wide" | "region";

export interface ZoneFilterDefinition {
  id: ZoneId;
  label: string;
  group: ZoneFilterGroup;
  description: string;
  areas: string;
  example_providers: string[];
  /** Si aplica, la zona padre que también coincide al filtrar por sector RM. */
  parent_zone_id?: ZoneId;
}

export const ZONE_FILTER_DEFINITIONS: ZoneFilterDefinition[] = [
  {
    id: "rm-metropolitana",
    label: "Región Metropolitana",
    group: "rm_wide",
    description:
      "Cobertura en toda la Región Metropolitana. Incluye prestadores de cualquier sector de Santiago y alrededores.",
    areas:
      "Santiago, Providencia, Las Condes, Maipú, Puente Alto, San Bernardo y comunas RM en general.",
    example_providers: [
      "Redes amplias (Integramédica, Vidaintegra)",
      "Clínicas con presencia en varios sectores",
    ],
  },
  {
    id: "rm-oriente",
    label: "RM Oriente",
    group: "rm_sector",
    parent_zone_id: "rm-metropolitana",
    description:
      "Sector oriente de Santiago: comunas al este del centro, zona de alta concentración clínica.",
    areas:
      "Las Condes, Providencia, Vitacura, Lo Barnechea, La Reina, Peñalolén (orientación geográfica).",
    example_providers: [
      "Clínica Las Condes",
      "Clínica Indisa Providencia",
      "Clínica Alemana",
      "Clínica Santa María",
      "Red UC Christus",
    ],
  },
  {
    id: "rm-centro",
    label: "RM Centro",
    group: "rm_sector",
    parent_zone_id: "rm-metropolitana",
    description: "Santiago centro y comunas céntricas con prestadores hospitalarios y ambulatorios.",
    areas: "Santiago centro, Ñuñoa (sector central), comunas del eje céntrico.",
    example_providers: [
      "Clínica RedSalud Santiago",
      "Clínica Meds",
      "Hospital Clínico UC",
      "Hospital Clínico U. de Chile",
    ],
  },
  {
    id: "rm-norte",
    label: "RM Norte",
    group: "rm_sector",
    parent_zone_id: "rm-metropolitana",
    description: "Sector norte de la RM: comunas del sector nororiente y norte de Santiago.",
    areas: "Huechuraba, Quilicura, Conchalí, Independencia y sector norte metropolitano.",
    example_providers: ["Clínica Dávila Vespucio", "Centros en sector norte RM"],
  },
  {
    id: "rm-sur",
    label: "RM Sur",
    group: "rm_sector",
    parent_zone_id: "rm-metropolitana",
    description: "Sector sur de la RM: comunas al sur del centro de Santiago.",
    areas: "San Bernardo, La Florida, Puente Alto y comunas del sector sur.",
    example_providers: ["Hospital Parroquial de San Bernardo"],
  },
  {
    id: "rm-poniente",
    label: "RM Poniente",
    group: "rm_sector",
    parent_zone_id: "rm-metropolitana",
    description: "Sector poniente de Santiago: comunas al oeste del centro.",
    areas: "Maipú, Pudahuel, Cerrillos, Estación Central (poniente).",
    example_providers: [
      "Clínica Indisa Maipú",
      "Clínica Bupa Santiago",
    ],
  },
  {
    id: "norte",
    label: "Zona Norte",
    group: "region",
    description:
      "Regiones del norte grande de Chile. Planes con prestadores fuera de la RM hacia Arica, Tarapacá, Antofagasta y Coquimbo.",
    areas: "Arica, Iquique, Antofagasta, Atacama, Coquimbo / Elqui.",
    example_providers: [
      "Clínica San José (Arica / Interclínica)",
      "Clínica RedSalud Iquique",
      "Clínica RedSalud Elqui",
      "Clínica Atacama",
    ],
  },
  {
    id: "octava",
    label: "Octava Región",
    group: "region",
    description:
      "Zona centro-sur: Biobío, Ñuble, Maule y sur central. Complementa la cobertura fuera de Santiago.",
    areas: "Concepción, Chillán, Talca, Los Ángeles y zona sur-central.",
    example_providers: [
      "Clínica Biobío",
      "Clínica Andes Salud Concepción",
      "Clínica Los Andes Los Ángeles",
      "Sanatorio Alemán",
    ],
  },
  {
    id: "valparaiso",
    label: "Valparaíso",
    group: "region",
    description: "Región de Valparaíso y Costa central.",
    areas: "Viña del Mar, Valparaíso, Reñaca, Quilpué.",
    example_providers: [
      "Clínica RedSalud Valparaíso",
      "Clínica Bupa Reñaca",
      "Hospital Clínico de Viña del Mar",
    ],
  },
  {
    id: "biobio",
    label: "Biobío",
    group: "region",
    description:
      "Sur de Chile: Biobío, Araucanía, Los Ríos, Los Lagos y Magallanes (prestadores del sur).",
    areas: "Concepción, Temuco, Valdivia, Puerto Montt, Punta Arenas.",
    example_providers: [
      "Clínica Alemana Temuco",
      "Clínica Alemana Valdivia",
      "Clínica RedSalud Magallanes",
    ],
  },
];

const ZONE_FILTER_INTRO = [
  "Un plan aparece si tiene al menos un prestador (clínica o centro) en alguna de las zonas que marques.",
  "Las zonas se calculan desde las clínicas de la cobertura del plan. Si el plan no tiene detalle de clínicas, se usan zonas asignadas al importarlo (ej. planes de regiones).",
  "Puedes marcar varias zonas a la vez: se muestran planes que coincidan con cualquiera de ellas.",
  "Para ver planes de cualquier zona, desmarca todas las opciones o usa «Limpiar filtros» en el panel.",
] as const;

const ZONE_FILTER_FOOTNOTE =
  "Los sectores RM (Oriente, Centro, etc.) son subáreas de la Región Metropolitana. Muchas clínicas pertenecen a su sector y también a «Región Metropolitana».";

export const ZONE_FILTER_HELP_UI = {
  title: "¿Cómo funciona el filtro por zona?",
  paragraphs: [...ZONE_FILTER_INTRO],
  items: ZONE_FILTER_DEFINITIONS.map((zone) => ({
    label: zone.label,
    text: `${zone.description} Áreas: ${zone.areas}`,
  })),
  footnote: ZONE_FILTER_FOOTNOTE,
  source: "Cotizador Isapres — catálogo de clínicas y zonas",
} as const;

function resolveGuideUrl(request: Request): string {
  const configured = process.env.PUBLIC_API_BASE_URL?.trim();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  const origin = configured
    ? configured.replace(/\/api\/public\/v1\/?$/, "")
    : host
      ? `${protocol}://${host}`
      : "https://cotizador.cotizaloantes.cl";

  return `${origin.replace(/\/$/, "")}/api/public/${PUBLIC_API_VERSION}/ui/filters`;
}

export function buildZoneFilterApiGuide(request: Request) {
  const guideUrl = resolveGuideUrl(request);

  return {
    version: "1.0.0",
    component: "zone_filter",
    title: "Guía — Filtro por zona geográfica",
    description:
      "Especificación de zonas/sectores del cotizador para integradores (Cotízalo Antes, buscadores externos) y agentes de IA. Define qué significa cada zona y cómo filtrar planes.",
    canonical_url: guideUrl,
    filter_logic: {
      matching_rule:
        "OR — el plan se incluye si su conjunto de zonas intersecta con al menos una zona activa en el filtro.",
      plan_zone_resolution: [
        "1. Unión de zonas de todas las clínicas en coverage[] del plan.",
        "2. Unión con zones[] explícitas del plan (importación o backfill).",
        "3. Si el plan no tiene zonas resueltas, no aparece cuando hay filtro de zona activo.",
      ],
      clinic_zone_source:
        "Mapa estático clinic_id → zone_ids en src/lib/clinic-zones.ts (sincronizado a BD en clinics.zones).",
      default_active_zone_ids: [
        "rm-metropolitana",
        "rm-oriente",
        "rm-centro",
      ],
      no_zone_filter_active:
        "Si ninguna zona está marcada, no se aplica filtro geográfico (muestra todos los planes).",
    },
    groups: {
      rm_wide: {
        label: "Región Metropolitana (amplia)",
        description: "Cobertura en cualquier sector de la RM.",
      },
      rm_sector: {
        label: "Sectores RM",
        description:
          "Subdivisiones orientativas de Santiago/RM. Cada sector suele incluir también rm-metropolitana en la resolución de clínicas.",
      },
      region: {
        label: "Regiones fuera de RM",
        description: "Norte, Valparaíso, sur y zonas interregionales.",
      },
    },
    zones: ZONE_FILTER_DEFINITIONS.map((zone) => ({
      id: zone.id,
      label: zone.label,
      group: zone.group,
      description: zone.description,
      areas: zone.areas,
      example_providers: zone.example_providers,
      parent_zone_id: zone.parent_zone_id ?? null,
    })),
    filter_options: ZONE_FILTER_OPTIONS,
    deep_link: {
      param: "zonas",
      format: "Lista separada por comas de zone id (ej. zonas=rm-oriente,rm-centro,norte)",
      example: "zonas=rm-metropolitana,rm-oriente,norte",
      behavior:
        "Al abrir el cotizador vía URL, solo quedan activas las zonas listadas; las demás se desactivan.",
    },
    ui_help: ZONE_FILTER_HELP_UI,
    integrator_notes: [
      "Replica el ícono informativo (ℹ) junto al título «Filtrado por Zona» usando ui_help.",
      "Usa zones[].id como valor de checkbox y en el parámetro zonas del deep link.",
      "Para Cotízalo Antes: consumir GET /api/public/v1/ui/filters (sin autenticación).",
      "Los planes en la API incluyen zones[] cuando están persistidos; el filtrado en servidor usa cobertura + zones.",
    ],
    related_endpoints: {
      plans_search: "/api/plans/search",
      plan_card_ui: "/api/public/v1/ui/plan-card",
      docs: "/api/public/v1/docs",
    },
  } as const;
}

export const FILTER_CLEARING_HELP_UI = {
  title: "¿Cómo limpiar filtros y ver todos los planes?",
  paragraphs: [
    "El botón «Limpiar filtros» del panel desactiva Isapres, zonas, tipos de plan y umbrales de cobertura.",
    "En cada grupo de checkboxes, si ninguna opción está marcada, ese filtro no se aplica (se incluyen todos los valores de ese eje).",
    "«Limpiar todo» en la barra superior además resetea región, ingreso, edad, cargas, precio y resultados de búsqueda.",
  ],
  button_labels: {
    clear_filters: "Limpiar filtros",
    reset_all: "Limpiar todo",
  },
} as const;

export function buildPlanTypeFilterApiGuide() {
  return {
    version: "1.0.0",
    component: "plan_type_filter",
    title: "Guía — Filtro por tipo de plan",
    filter_logic: {
      matching_rule:
        "OR — el plan se incluye si su tipo inferido coincide con al menos un tipo marcado.",
      inference_rules: [
        "preferred: has_top, o nombre/notas contienen «preferente».",
        "free_choice: nombre/notas contienen «libre elección» o patrón «le ».",
        "closed: nombre contiene «cerrado» o «-sf», o notas contienen «cerrado».",
        "Si no se infiere ninguno, se asume free_choice.",
      ],
      no_plan_type_filter_active:
        "Si ningún tipo está marcado, no se aplica filtro por modalidad (muestra todos los planes).",
      default_active_type_ids: PLAN_TYPE_FILTER_DEFAULT_IDS,
    },
    types: PLAN_TYPE_FILTER_OPTIONS.map((option) => {
      const helpItem = FILTER_HELP.planType.items.find((item) => {
        const normalized = item.label
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");
        const optionLabel = option.label
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");
        return normalized === optionLabel;
      });
      return {
        id: option.id,
        label: option.label,
        description: helpItem?.text ?? option.label,
      };
    }),
    deep_link: {
      param: "tipoPlan",
      format: "Lista separada por comas de plan type id (ej. tipoPlan=closed,preferred)",
      example: "tipoPlan=closed,free_choice,preferred",
      behavior:
        "Al abrir el cotizador vía URL, solo quedan activos los tipos listados; los demás se desactivan.",
    },
    ui_help: FILTER_HELP.planType,
  } as const;
}

export function buildFilterClearingApiGuide() {
  return {
    version: "1.0.0",
    component: "filter_clearing",
    title: "Guía — Limpiar filtros y mostrar todos los planes",
    cleared_filters_state: {
      isapres: "ninguna isapre marcada → sin filtro por isapre",
      zones: "ninguna zona marcada → sin filtro geográfico",
      plan_types: "ningún tipo marcado → sin filtro por modalidad",
      hospital_coverage_percent: null,
      ambulatory_coverage_percent: null,
    },
    default_filters_state: {
      note: "Estado inicial al abrir el cotizador o al usar «Limpiar todo» (solo la parte de filtros).",
      isapres: ["consalud"],
      zones: ["rm-metropolitana", "rm-oriente", "rm-centro"],
      plan_types: PLAN_TYPE_FILTER_DEFAULT_IDS,
      hospital_coverage_percent: null,
      ambulatory_coverage_percent: null,
    },
    ui_help: FILTER_CLEARING_HELP_UI,
  } as const;
}

export function buildFiltersUiGuide(request: Request) {
  const zoneGuide = buildZoneFilterApiGuide(request);
  const planTypeGuide = buildPlanTypeFilterApiGuide();
  const clearingGuide = buildFilterClearingApiGuide();

  return {
    version: "1.1.0",
    title: "Guía UI — Filtros del cotizador",
    description:
      "Documentación de filtros del panel lateral para integradores: zonas, tipos de plan y cómo limpiar filtros.",
    canonical_url: zoneGuide.canonical_url,
    sections: {
      zone_filter: zoneGuide,
      plan_type_filter: planTypeGuide,
      filter_clearing: clearingGuide,
    },
  } as const;
}
