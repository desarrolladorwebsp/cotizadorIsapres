import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryEnv } from "@/lib/cloudinary/env";

let configured = false;

export function configureCloudinary(): typeof cloudinary {
  if (!configured) {
    const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    configured = true;
  }

  return cloudinary;
}
