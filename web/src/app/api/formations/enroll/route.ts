import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import OnlineFormationModel from "@/lib/models/OnlineFormation";
import PresentialFormationModel from "@/lib/models/PresentialFormation";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.formationId !== "string") {
    return NextResponse.json(
      { error: "formationId requis" },
      { status: 400 },
    );
  }
  const formationId: string = body.formationId;
  const sessionId: number | undefined =
    typeof body.sessionId === "number" ? body.sessionId : undefined;

  try {
    await connectToDatabase();

    const online = await OnlineFormationModel.findById(formationId);
    if (online) {
      const alreadyOwner = (online.owners as { userId: string }[] | undefined)
        ?.some((o) => o.userId === userId);
      if (!alreadyOwner) {
        await OnlineFormationModel.updateOne(
          { _id: online._id },
          {
            $push: {
              owners: { userId, purchaseDate: new Date() },
            },
          },
        );
      }
      return NextResponse.json({ ok: true, type: "online" });
    }

    const presential = await PresentialFormationModel.findById(formationId);
    if (presential) {
      let targetSessionId = sessionId;
      if (targetSessionId === undefined) {
        const openSession = (
          presential.sessions as { id: number; status: string }[] | undefined
        )?.find((s) => s.status === "open");
        if (!openSession) {
          return NextResponse.json(
            { error: "Aucune session ouverte" },
            { status: 400 },
          );
        }
        targetSessionId = openSession.id;
      }

      const targetSession = (
        presential.sessions as
          | { id: number; status: string; participants?: string[] }[]
          | undefined
      )?.find((s) => s.id === targetSessionId);
      if (!targetSession) {
        return NextResponse.json(
          { error: "Session introuvable" },
          { status: 404 },
        );
      }
      if (targetSession.status !== "open") {
        return NextResponse.json(
          { error: "Session non disponible" },
          { status: 400 },
        );
      }

      const alreadyParticipant = targetSession.participants?.includes(userId);
      if (!alreadyParticipant) {
        await PresentialFormationModel.updateOne(
          { _id: presential._id, "sessions.id": targetSessionId },
          {
            $addToSet: { "sessions.$.participants": userId },
            $inc: { "sessions.$.availableSpots": -1 },
          },
        );
      }
      return NextResponse.json({
        ok: true,
        type: "presentiel",
        sessionId: targetSessionId,
      });
    }

    return NextResponse.json(
      { error: "Formation introuvable" },
      { status: 404 },
    );
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
