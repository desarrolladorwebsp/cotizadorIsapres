import { configureCloudinary } from "@/lib/cloudinary/config";

export function buildPlanPdfDeliveryUrl(publicId: string): string {
  const cloudinary = configureCloudinary();

  return cloudinary.url(publicId, {
    resource_type: "raw",
    secure: true,
    flags: "attachment",
  });
}
