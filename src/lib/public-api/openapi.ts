import {
  PUBLIC_API_BASE_PATH,
  PUBLIC_API_KEY_HEADER,
  PUBLIC_API_VERSION,
} from "@/lib/public-api/constants";
import { getDeepLinkDocumentation } from "@/lib/deep-link/build-cotizador-url";

function resolveBaseUrl(request: Request): string {
  const configured = process.env.PUBLIC_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    return `https://cotizador.cotizaloantes.cl${PUBLIC_API_BASE_PATH}`;
  }

  return `${protocol}://${host}${PUBLIC_API_BASE_PATH}`;
}

export function buildPublicApiAgentGuide(request: Request) {
  const baseUrl = resolveBaseUrl(request);

  return {
    api: {
      name: "Cotizador Isapres — API pública",
      version: PUBLIC_API_VERSION,
      base_url: baseUrl,
      status: "beta",
      description:
        "API para integradores y agentes de IA. Expone listado de planes y documentación de deep links para redirigir usuarios al cotizador web con parámetros en la URL.",
    },
    authentication: {
      required: true,
      methods: [
        {
          type: "bearer",
          header: "Authorization",
          format: "Bearer <PUBLIC_API_SECRET>",
          example: "Authorization: Bearer tu-clave-secreta",
        },
        {
          type: "api_key",
          header: PUBLIC_API_KEY_HEADER,
          format: "<PUBLIC_API_SECRET>",
          example: `${PUBLIC_API_KEY_HEADER}: tu-clave-secreta`,
        },
      ],
      notes: [
        "Toda solicitud a endpoints de datos debe incluir la clave secreta.",
        "La clave se configura en el servidor como PUBLIC_API_SECRET.",
        "No compartas la clave en repositorios públicos ni en el frontend del cliente.",
        "Ante 401 INVALID_API_SECRET o MISSING_API_SECRET, verifica la cabecera.",
      ],
    },
    endpoints: [
      {
        method: "GET",
        path: `${baseUrl}/docs`,
        summary: "Esta guía (autodocumentación para agentes e integradores)",
        auth_required: true,
      },
      {
        method: "GET",
        path: `${baseUrl}/plans`,
        summary: "Listado completo de planes de salud con coberturas",
        auth_required: true,
        response: {
          content_type: "application/json",
          shape: {
            data: "HealthPlan[]",
            meta: { total: "number", version: "string" },
          },
        },
      },
    ],
    cotizador_deep_link: getDeepLinkDocumentation(
      process.env.PUBLIC_API_BASE_URL?.replace(/\/api\/public\/v1\/?$/, "") ??
        "https://cotizador.cotizaloantes.cl",
    ),
    health_plan_schema: {
      type: "object",
      required: [
        "isapre",
        "plan_name",
        "unique_code",
        "base_price_uf",
        "has_top",
        "coverage",
      ],
      properties: {
        isapre: { type: "string", description: "Nombre de la Isapre." },
        plan_name: { type: "string", description: "Nombre comercial del plan." },
        unique_code: {
          type: "string",
          description: "Identificador único del plan (PK).",
        },
        base_price_uf: {
          type: "number",
          description: "Precio base en UF (Unidad de Fomento).",
        },
        has_top: {
          type: "boolean",
          description: "Indica si el plan incluye cobertura TOP.",
        },
        additional_notes: {
          type: "string",
          nullable: true,
          description: "Notas adicionales del plan.",
        },
        pdf_url: {
          type: "string",
          nullable: true,
          description:
            "URL del PDF cuando está disponible (puede ser absoluta o relativa). Descarga vía API próximamente.",
        },
        pdf_public_id: {
          type: "string",
          nullable: true,
          description: "Identificador interno del PDF en almacenamiento.",
        },
        coverage: {
          type: "array",
          description: "Coberturas por clínica/prestador.",
          items: {
            type: "object",
            properties: {
              clinic_id: { type: "string" },
              clinic_name: { type: "string" },
              percentage: { type: "integer", minimum: 0, maximum: 100 },
              type: {
                type: "string",
                enum: ["hospitalaria", "ambulatoria"],
              },
            },
          },
        },
      },
    },
    examples: {
      list_plans_curl: `curl -s "${baseUrl}/plans" \\
  -H "Authorization: Bearer $PUBLIC_API_SECRET"`,
      list_plans_fetch: `fetch("${baseUrl}/plans", {
  headers: { Authorization: "Bearer " + process.env.PUBLIC_API_SECRET }
})`,
    },
    errors: [
      { status: 401, code: "MISSING_API_SECRET", message: "Falta la clave." },
      { status: 401, code: "INVALID_API_SECRET", message: "Clave incorrecta." },
      {
        status: 503,
        code: "PUBLIC_API_NOT_CONFIGURED",
        message: "PUBLIC_API_SECRET no configurada en el servidor.",
      },
    ],
    roadmap: [
      "GET /plans/{uniqueCode}/pdf — descarga de PDF con la misma autenticación.",
      "GET /plans/search — búsqueda paginada con filtros.",
    ],
    openapi: buildOpenApiDocument(baseUrl),
  } as const;
}

function buildOpenApiDocument(baseUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Cotizador Isapres API",
      version: PUBLIC_API_VERSION,
      description:
        "API pública del cotizador de planes Isapre. Autenticación obligatoria con PUBLIC_API_SECRET. Para enviar usuarios al cotizador con datos prellenados, consulta el objeto cotizador_deep_link en GET /docs (no requiere API key).",
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Valor de PUBLIC_API_SECRET",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: PUBLIC_API_KEY_HEADER,
          description: "Valor de PUBLIC_API_SECRET",
        },
      },
      schemas: {
        CoverageEntry: {
          type: "object",
          required: ["clinic_id", "clinic_name", "percentage", "type"],
          properties: {
            clinic_id: { type: "string" },
            clinic_name: { type: "string" },
            percentage: { type: "integer" },
            type: { type: "string", enum: ["hospitalaria", "ambulatoria"] },
          },
        },
        HealthPlan: {
          type: "object",
          required: [
            "isapre",
            "plan_name",
            "unique_code",
            "base_price_uf",
            "has_top",
            "coverage",
          ],
          properties: {
            isapre: { type: "string" },
            plan_name: { type: "string" },
            unique_code: { type: "string" },
            base_price_uf: { type: "number" },
            has_top: { type: "boolean" },
            additional_notes: { type: "string", nullable: true },
            pdf_url: { type: "string", nullable: true },
            pdf_public_id: { type: "string", nullable: true },
            coverage: {
              type: "array",
              items: { $ref: "#/components/schemas/CoverageEntry" },
            },
          },
        },
        PlansResponse: {
          type: "object",
          required: ["data", "meta"],
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/HealthPlan" },
            },
            meta: {
              type: "object",
              properties: {
                total: { type: "integer" },
                version: { type: "string" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
            code: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
    paths: {
      "/docs": {
        get: {
          operationId: "getPublicApiDocs",
          summary: "Guía y OpenAPI para agentes e integradores",
          responses: {
            "200": { description: "Documentación JSON" },
            "401": {
              description: "Clave ausente o inválida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/plans": {
        get: {
          operationId: "listHealthPlans",
          summary: "Listar todos los planes de salud",
          responses: {
            "200": {
              description: "Listado de planes",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PlansResponse" },
                },
              },
            },
            "401": {
              description: "Clave ausente o inválida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  };
}
