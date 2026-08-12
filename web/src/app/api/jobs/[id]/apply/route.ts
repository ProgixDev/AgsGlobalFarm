import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applyToJob } from "@/lib/jobs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "job_seeker" && role !== "admin") {
    return NextResponse.json(
      { error: "Réservé aux chercheurs d'emploi" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (
    !body ||
    !body.applicantName ||
    !body.applicantEmail ||
    !body.applicantPhone ||
    !body.education ||
    !body.experience ||
    !body.desiredPosition ||
    !body.salaryExpectation
  ) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 },
    );
  }

  const result = await applyToJob(id, session.user.id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(
    { application: result.application },
    { status: 201 },
  );
}
