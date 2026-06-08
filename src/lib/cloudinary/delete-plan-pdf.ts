import { configureCloudinary } from "@/lib/cloudinary/config";

export async function deletePlanPdf(publicId: string): Promise<void> {
  const trimmed = publicId.trim();
  if (!trimmed) return;

  const cloudinary = configureCloudinary();

  await cloudinary.uploader.destroy(trimmed, {
    resource_type: "raw",
    invalidate: true,
  });
}
