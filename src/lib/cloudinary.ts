import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

if (!process.env.CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL environment variable is not set");
}

export { cloudinary };
export type CloudinaryUploadApiResponse = UploadApiResponse;
