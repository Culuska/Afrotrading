import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `afrotrading/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteAsset(publicId: string, resourceType: "image" | "video" | "raw" = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Forces Cloudinary to serve the asset as a proper file download (correct
 * Content-Type + Content-Disposition/filename), regardless of what extension
 * the underlying public_id happens to have.
 */
export function withAttachment(url: string, filename: string, extension: string): string {
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const insertAt = idx + marker.length;
  const safeName = `${filename.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 80)}.${extension}`;
  return `${url.slice(0, insertAt)}fl_attachment:${encodeURIComponent(safeName)}/${url.slice(insertAt)}`;
}

export default cloudinary;
