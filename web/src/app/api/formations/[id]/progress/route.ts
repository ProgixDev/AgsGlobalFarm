import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProgress, updateProgress } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getProgress(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ completedLessons: result.data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.completedLessons)) {
    return NextResponse.json(
      { error: "completedLessons doit être un tableau" },
      { status: 400 },
    );
  }

  const result = await updateProgress(id, body.completedLessons);
  if (!result.success) {
    const status = result.error?.includes("don't own") ? 403 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ completedLessons: result.data });
}
