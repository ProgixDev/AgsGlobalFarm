import { NextRequest, NextResponse } from "next/server";
import { getPresentialFormationById } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const formation = await getPresentialFormationById(id);
  if (!formation) {
    return NextResponse.json(
      { error: "Formation introuvable" },
      { status: 404 },
    );
  }
  return NextResponse.json({ formation });
}
