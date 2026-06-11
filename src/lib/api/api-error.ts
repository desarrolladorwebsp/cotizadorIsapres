import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const target = Array.isArray(error.meta?.target)
      ? (error.meta.target as string[]).join(", ")
      : undefined;

    switch (error.code) {
      case "P2002":
        return new ApiError(
          target?.includes("unique_code")
            ? "Ya existe un plan con ese código único."
            : "Ya existe un registro con esos datos.",
          409,
          error.code,
        );
      case "P2003":
        return new ApiError(
          "No se puede guardar el plan porque faltan datos relacionados (isapre o clínica).",
          400,
          error.code,
        );
      case "P2025":
        return new ApiError("El plan solicitado no existe.", 404, error.code);
      default:
        return new ApiError(
          "Error de base de datos al procesar el plan.",
          500,
          error.code,
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(
      "Los datos del plan no son válidos para la base de datos.",
      400,
    );
  }

  if (error instanceof SyntaxError) {
    return new ApiError("El cuerpo de la solicitud no es JSON válido.", 400);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError("Ocurrió un error inesperado al procesar el plan.", 500);
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError("El cuerpo de la solicitud no es JSON válido.", 400);
  }
}

export function apiErrorResponse(error: unknown): {
  body: { error: string; code?: string };
  status: number;
} {
  const apiError = toApiError(error);

  return {
    body: {
      error: apiError.message,
      ...(apiError.code ? { code: apiError.code } : {}),
    },
    status: apiError.status,
  };
}
