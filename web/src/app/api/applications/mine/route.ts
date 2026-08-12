import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listMyApplications } from "@/lib/jobs";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const applications = await listMyApplications(session.user.id);
  return NextResponse.json({ applications });
}
