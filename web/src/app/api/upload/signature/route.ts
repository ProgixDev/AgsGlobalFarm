import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateUploadSignature,
  type UploadFolder,
} from "@/lib/cloudinary";

const VALID_FOLDERS: UploadFolder[] = [
  "ags/products",
  "ags/avatars",
  "ags/jobs",
  "ags/incidents",
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const folderRaw = body?.folder as string | undefined;

    const folder: UploadFolder =
      folderRaw && VALID_FOLDERS.includes(folderRaw as UploadFolder)
        ? (folderRaw as UploadFolder)
        : "ags/products";

    const adminOnlyFolders: UploadFolder[] = ["ags/products"];
    if (adminOnlyFolders.includes(folder)) {
      const role = (session.user as { role?: string }).role;
      if (role !== "admin") {
        return NextResponse.json(
          { error: "Accès réservé à l'administrateur" },
          { status: 403 },
        );
      }
    }

    const signed = generateUploadSignature(folder);
    return NextResponse.json(signed);
  } catch (error) {
    console.error("Failed to generate upload signature", error);
    const message =
      error instanceof Error ? error.message : "Erreur de signature";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
