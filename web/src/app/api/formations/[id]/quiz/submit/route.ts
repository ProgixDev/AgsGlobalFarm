import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitQuiz } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.answers)) {
    return NextResponse.json(
      { error: "answers doit être un tableau" },
      { status: 400 },
    );
  }

  const result = await submitQuiz(id, body.answers);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}
