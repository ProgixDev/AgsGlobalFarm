import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFormationQuiz } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const quiz = await getFormationQuiz(id);
  if (!quiz) {
    return NextResponse.json(
      { error: "Quiz indisponible (vérifiez ownership et progression)" },
      { status: 403 },
    );
  }
  return NextResponse.json({ quiz });
}
