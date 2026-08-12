import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listJobs, createJob } from "@/lib/jobs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await listJobs({
    region: searchParams.get("region") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    contractType: searchParams.get("contractType") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    limit: searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined,
    offset: searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : undefined,
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "farm_owner" && role !== "admin") {
    return NextResponse.json(
      { error: "Réservé aux propriétaires de ferme" },
      { status: 403 },
    );
  }
  const body = await request.json().catch(() => null);
  if (!body || !body.title || !body.farmName) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  const job = await createJob(session.user.id, body);
  return NextResponse.json({ job }, { status: 201 });
}
