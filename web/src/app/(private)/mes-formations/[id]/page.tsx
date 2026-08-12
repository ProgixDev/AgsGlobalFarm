import { auth } from "@/lib/auth";
import { getOwnedFormations, getFormationProgress } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import FormationContent from "./FormationContent";
import Image from "next/image";
import BackButton from "./BackButton";
import type { OnlineFormation } from "@/types";

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id: formationId } = await params;

  // Check if user owns this formation
  const { online: ownedOnlineFormations } = await getOwnedFormations();
  const formation = ownedOnlineFormations.find(
    (f) => f._id?.valueOf() === formationId,
  );

  if (!formation) {
    redirect("/mes-formations");
  }

  // Get user progress
  const progress = await getFormationProgress(formationId);
  const initialProgress = progress ? progress.completedLessons : [];

  // Filter out content from inaccessible lessons
  const sanitizedFormation: OnlineFormation = JSON.parse(
    JSON.stringify(formation),
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <BackButton />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {formation.title}
            </h1>
            <p className="text-gray-600 mb-4">{formation.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📚 {formation.level}</span>
              <span>
                📹{" "}
                {formation.sections?.reduce(
                  (acc, section) => acc + section.lessons.length,
                  0,
                ) || 0}{" "}
                leçons
              </span>
            </div>
          </div>
          <div className="md:w-80">
            <Image
              src={formation.image}
              alt={formation.title}
              width={320}
              height={180}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Interactive Content */}
      <FormationContent
        formation={sanitizedFormation}
        formationMongoId={formationId}
        initialProgress={initialProgress}
      />
    </div>
  );
}
