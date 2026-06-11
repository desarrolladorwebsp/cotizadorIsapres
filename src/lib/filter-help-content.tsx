/**
 * Textos informativos de filtros — basados en definiciones de la
 * Superintendencia de Salud, IPSUSS y glosarios de Isapres en Chile.
 * Referencias: superdesalud.gob.cl, ipsuss.cl, isapre.info
 */

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
      "El monto final también depende de los topes del plan (límites en UF), no solo del porcentaje.",
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
} as const;
