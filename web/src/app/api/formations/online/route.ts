import { NextResponse } from "next/server";
import { getPublicOnlineFormations } from "@/lib/db";

export async function GET() {
  const formations = await getPublicOnlineFormations();
  return NextResponse.json({ formations });
}
