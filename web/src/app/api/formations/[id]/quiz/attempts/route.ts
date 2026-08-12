import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuizAttemptsToday } from "@/lib/db";

const MAX_DAILY_ATTEMPTS = 3;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const attemptsToday = await getQuizAttemptsToday(id);
  return NextResponse.json({
    attemptsToday,
    maxDailyAttempts: MAX_DAILY_ATTEMPTS,
    remaining: Math.max(MAX_DAILY_ATTEMPTS - attemptsToday, 0),
  });
}
