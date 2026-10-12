import { ApiError } from "./client";

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadProductImage(file: File): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files (jpg, png, webp) allowed");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 5MB");
  }
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/uploads/product-image", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) {
    let message = `Upload failed with ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body.message === "string") message = body.message;
      else if (Array.isArray(body.message)) message = body.message.join(" ");
    } catch {
      // keep default
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as UploadResult;
}
