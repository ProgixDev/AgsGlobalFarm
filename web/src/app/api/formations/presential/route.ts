import { NextResponse } from "next/server";
import { getPublicPresentialFormations } from "@/lib/db";

export async function GET() {
  const formations = await getPublicPresentialFormations();
  return NextResponse.json({ formations });
}
