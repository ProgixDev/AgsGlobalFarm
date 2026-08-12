import { auth } from "@/lib/auth";
import { getOwnedFormations } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import MesFormationsClient from "./MesFormationsClient";
import type {
  FormationSession,
  OnlineFormation,
  PresentialFormation,
} from "@/types";

export default async function MesFormationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { presential: presentialFormations, online: onlineFormations } =
    await getOwnedFormations();

  // Serialize formations to plain objects
  const serializedOnline: OnlineFormation[] = JSON.parse(
    JSON.stringify(onlineFormations),
  );

  const serializedPresential: PresentialFormation[] = JSON.parse(
    JSON.stringify(presentialFormations),
  );

  // Extract presential sessions by status
  const purchasedPresentialSessions: {
    formation: PresentialFormation;
    session: FormationSession;
  }[] = [];

  serializedPresential.forEach((formation) => {
    formation.sessions?.forEach((sess: FormationSession) => {
      if (sess.owned) {
        purchasedPresentialSessions.push({ formation, session: sess });
      }
    });
  });

  // Categorize presential sessions by status
  const prevFormations = purchasedPresentialSessions.filter(
    ({ session }) => session.status === "done",
  );
  const upFormations = purchasedPresentialSessions.filter(
    ({ session }) => session.status === "open" || session.status === "ongoing",
  );

  return (
    <MesFormationsClient
      onlineCourses={serializedOnline}
      previousFormations={prevFormations}
      upcomingFormations={upFormations}
    />
  );
}
