import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listMyJobs } from "@/lib/jobs";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const jobs = await listMyJobs(session.user.id);
  return NextResponse.json({ jobs });
}
