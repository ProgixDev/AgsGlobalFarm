import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setJobStatus } from "@/lib/jobs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.status !== "string") {
    return NextResponse.json({ error: "Statut requis" }, { status: 400 });
  }
  const result = await setJobStatus(id, session.user.id, body.status);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ job: result.job });
}
