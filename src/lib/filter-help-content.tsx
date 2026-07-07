/**
 * Textos informativos de filtros — basados en definiciones de la
 * Superintendencia de Salud, IPSUSS y glosarios de Isapres en Chile.
 * Referencias: superdesalud.gob.cl, ipsuss.cl, isapre.info
 */

import { ZONE_FILTER_HELP_UI } from "@/lib/zone-filter-guide";

export const FILTER_HELP = {
  isapre: {
    title: "¿Qué es una Isapre?",
    body: [
      "Institución de salud previsional privada que comercializa planes de salud en Chile.",
      "Cada Isapre ofrece distintos planes, precios y redes de clínicas. Este filtro acota los resultados a la compañía que elijas.",
    ],
    source: "Superintendencia de Salud",
  },
  planType: {
    title: "Tipos de plan",
    paragraphs: [
      "Por defecto los tres tipos están marcados (Cerrado, Libre Elección y Preferente).",
      "Si desmarcas todos los tipos, no se aplica este filtro y se muestran planes de cualquier modalidad.",
      "Usa «Limpiar filtros» en el panel para quitar todas las restricciones de una vez.",
    ],
    items: [
      {
        label: "Libre elección",
        text: "Puedes atenderte en el prestador que elijas. La Isapre bonifica un porcentaje del costo de la atención.",
      },
      {
        label: "Preferente",
        text: "Mayor bonificación en clínicas o centros convenidos. Si te atiendes fuera de esa red, aplica cobertura de libre elección, generalmente menor.",
      },
      {
        label: "Cerrado",
        text: "Cobertura orientada a prestadores definidos en el contrato, sin opción de libre elección.",
      },
    ],
    footnote:
      "Por ley, los planes Isapre deben cubrir al menos lo mismo que Fonasa en libre elección.",
    source: "Superintendencia de Salud · isapre.info",
  },
  coverage: {
    title: "¿Qué significa el porcentaje?",
    body: [
      "Es la parte del costo de una prestación que bonifica tu Isapre. El resto lo pagas tú como copago.",
      "Puedes combinar clínica (opcional) y porcentaje mínimo: si eliges ambos, el plan debe cumplir ese % en esa clínica o superior.",
      "Si solo eliges porcentaje, basta con que algún prestador del plan alcance ese mínimo.",
    ],
    items: [
      {
        label: "Hospitalaria",
        text: "Cirugías, hospitalizaciones y atenciones con internación. Suele ser de mayor costo.",
      },
      {
        label: "Ambulatoria",
        text: "Consultas, exámenes y procedimientos sin hospitalización (atención de día).",
      },
    ],
    source: "IPSUSS · Banmédica Orientación",
  },
  zone: ZONE_FILTER_HELP_UI,
} as const;
