import { apiFetch } from "@/lib/api/client";

export type UploadFolder =
  | "ags/products"
  | "ags/avatars"
  | "ags/jobs"
  | "ags/incidents";

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export async function getUploadSignature(
  folder: UploadFolder,
): Promise<SignedUploadParams> {
  return apiFetch<SignedUploadParams>("/api/upload/signature", {
    method: "POST",
    body: { folder },
    auth: true,
  });
}

export async function uploadToCloudinary(
  localUri: string,
  signed: SignedUploadParams,
  fileName = "upload.jpg",
): Promise<CloudinaryUploadResult> {
  const url = `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`;

  const form = new FormData();
  form.append("file", {
    uri: localUri,
    type: "image/jpeg",
    name: fileName,
  } as unknown as Blob);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("folder", signed.folder);

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Échec upload Cloudinary: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    secure_url: string;
    public_id: string;
  };
  return { secureUrl: data.secure_url, publicId: data.public_id };
}

export async function pickAndUploadImage(
  folder: UploadFolder,
  localUri: string,
): Promise<CloudinaryUploadResult> {
  const signed = await getUploadSignature(folder);
  const fileName = localUri.split("/").pop() || "upload.jpg";
  return uploadToCloudinary(localUri, signed, fileName);
}
