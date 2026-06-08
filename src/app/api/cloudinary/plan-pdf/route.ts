import { NextResponse } from "next/server";
import { isCloudinaryConfigured } from "@/lib/cloudinary/env";
import { uploadPlanPdf } from "@/lib/cloudinary/upload-plan-pdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary no está configurado. Agrega las variables CLOUDINARY_* en tu archivo .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uniqueCode = formData.get("uniqueCode");
    const isapre = formData.get("isapre");
    const previousPublicId = formData.get("previousPublicId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Debes enviar un archivo PDF en el campo file." },
        { status: 400 },
      );
    }

    if (typeof uniqueCode !== "string" || uniqueCode.trim().length === 0) {
      return NextResponse.json(
        { error: "El código único del plan es obligatorio." },
        { status: 400 },
      );
    }

    if (typeof isapre !== "string" || isapre.trim().length === 0) {
      return NextResponse.json(
        { error: "La Isapre es obligatoria para organizar el PDF." },
        { status: 400 },
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadPlanPdf({
      fileBuffer,
      isapre,
      uniqueCode,
      mimeType: file.type,
      previousPublicId:
        typeof previousPublicId === "string" && previousPublicId.trim().length > 0
          ? previousPublicId
          : null,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/cloudinary/plan-pdf", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo subir el PDF del plan.",
      },
      { status: 500 },
    );
  }
}
