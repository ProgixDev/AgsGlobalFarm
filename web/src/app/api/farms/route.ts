import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listMyFarms, createFarm } from "@/lib/farms";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const farms = await listMyFarms(session.user.id);
  return NextResponse.json({ farms });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.geometryType) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  if (body.geometryType === "point" && !body.coordinates) {
    return NextResponse.json(
      { error: "Coordonnées requises" },
      { status: 400 },
    );
  }
  if (
    body.geometryType === "polygon" &&
    (!Array.isArray(body.boundaryCoordinates) ||
      body.boundaryCoordinates.length < 3)
  ) {
    return NextResponse.json(
      { error: "Limite de 3 points minimum" },
      { status: 400 },
    );
  }
  const farm = await createFarm(session.user.id, body);
  return NextResponse.json({ farm }, { status: 201 });
}
