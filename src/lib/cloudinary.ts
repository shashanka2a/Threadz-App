const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export function getCloudinaryCloudName(): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
  }
  return cloudName;
}

export function getCloudinaryUploadPreset(): string {
  return process.env.CLOUDINARY_UPLOAD_PRESET ?? "ml_default";
}

export async function uploadProductImage(
  file: Buffer,
  filename: string,
): Promise<{ url: string; publicId: string }> {
  const cloudName = getCloudinaryCloudName();
  const uploadPreset = getCloudinaryUploadPreset();

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(file)], { type: getMimeType(filename) }),
    filename,
  );
  form.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  const data = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url || !data.public_id) {
    throw new Error(data.error?.message ?? "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}
