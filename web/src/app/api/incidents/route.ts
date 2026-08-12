import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listIncidents, createIncident } from "@/lib/incidents";
import type {
  IncidentCategory,
  IncidentStatus,
} from "@/lib/models/Incident";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await listIncidents({
    category:
      (searchParams.get("category") as IncidentCategory | null) ?? undefined,
    status:
      (searchParams.get("status") as IncidentStatus | null) ?? undefined,
    region: searchParams.get("region") ?? undefined,
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
  const body = await request.json().catch(() => null);
  if (
    !body ||
    !body.category ||
    !body.title ||
    !body.description ||
    !body.severity ||
    !body.coordinates ||
    typeof body.coordinates.longitude !== "number" ||
    typeof body.coordinates.latitude !== "number"
  ) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  const sessionUser = session.user as {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  const reporterName =
    sessionUser.firstName && sessionUser.lastName
      ? `${sessionUser.firstName} ${sessionUser.lastName}`.trim()
      : sessionUser.email;
  const incident = await createIncident(sessionUser.id, reporterName, body);
  return NextResponse.json({ incident }, { status: 201 });
}
