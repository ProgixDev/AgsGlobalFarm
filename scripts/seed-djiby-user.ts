/**
 * Creates ndiongue.djiby94@gmail.com, enrolls in all online formations,
 * marks all lessons complete, and records a passing quiz result.
 * Idempotent: cleans up any existing broken record first.
 *
 * Usage: npx tsx scripts/seed-djiby-user.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { MongoClient } from "mongodb";
import { hashPassword } from "@better-auth/utils/password";
import { nanoid } from "nanoid";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) { console.error("MONGODB_URI not set"); process.exit(1); }

const EMAIL = "ndiongue.djiby94@gmail.com";
const USER = {
  firstName: "Djiby",
  lastName: "Ndiongue",
  email: EMAIL,
  password: "Djibsonne94",
  phone: "770000094",
  gender: "male",
  role: "job_seeker",
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("Connected\n");

  const db = client.db();
  const users = db.collection("user");
  const accounts = db.collection("account");
  const formations = db.collection("onlineformations");
  const progress = db.collection("formationprogresses");
  const quizResults = db.collection("quizresults");

  // 1. Clean up any existing broken record
  const existing = await users.findOne({ email: EMAIL });
  if (existing) {
    const oldId = existing._id?.toString();
    await accounts.deleteMany({ userId: oldId });
    await formations.updateMany({} as never, { $pull: { owners: { userId: oldId } } } as never);
    await progress.deleteMany({ userId: oldId });
    await quizResults.deleteMany({ userId: oldId });
    await users.deleteOne({ email: EMAIL });
    console.log(`Cleaned up old record (id: ${oldId})`);
  }

  // 2. Create user with nanoid string _id (same format as better-auth)
  const now = new Date();
  const userId = nanoid();
  await users.insertOne({
    _id: userId,
    firstName: USER.firstName,
    lastName: USER.lastName,
    name: `${USER.firstName} ${USER.lastName}`,
    email: USER.email,
    emailVerified: true,
    phone: USER.phone,
    gender: USER.gender,
    role: USER.role,
    image: null,
    createdAt: now,
    updatedAt: now,
  } as never);
  console.log(`✓ Created user ${EMAIL} (id: ${userId})`);

  // 3. Credential account with hashed password
  const passwordHash = await hashPassword(USER.password);
  await accounts.insertOne({
    _id: nanoid(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  } as never);
  console.log(`✓ Created credential account`);

  // 4. Enroll + mark complete for each formation
  const allFormations = await formations.find({}).toArray();
  console.log(`\nProcessing ${allFormations.length} formation(s)...`);

  for (const f of allFormations) {
    const formationId = f._id.toString();

    // Enroll
    await formations.updateOne(
      { _id: f._id },
      { $push: { owners: { userId, purchaseDate: now } } } as never
    );
    console.log(`✓ Enrolled: "${f.title}"`);

    // Build completedLessons from all sections/lessons in the formation
    const completedLessons: string[] = [];
    const quizAnswers: { sectionId: number; questionId: number; selectedAnswer: string; correct: boolean }[] = [];
    let totalQuestions = 0;

    for (const section of (f.sections || [])) {
      for (const lesson of (section.lessons || [])) {
        completedLessons.push(`${section.id}-${lesson.id}`);
      }
    }

    // Build correct quiz answers
    for (const qSection of (f.quiz?.sections || [])) {
      for (const question of (qSection.questions || [])) {
        quizAnswers.push({
          sectionId: qSection.id,
          questionId: question.id,
          selectedAnswer: question.correctAnswer,
          correct: true,
        });
        totalQuestions++;
      }
    }

    // FormationProgress — all lessons done
    await progress.insertOne({
      _id: nanoid(),
      userId,
      formationId,
      completedLessons,
      lastAccessedAt: now,
      createdAt: now,
      updatedAt: now,
    } as never);
    console.log(`✓ Progress: ${completedLessons.length} lesson(s) marked complete`);

    // QuizResult — passed with perfect score
    await quizResults.insertOne({
      _id: nanoid(),
      userId,
      formationId,
      score: totalQuestions,
      totalQuestions,
      passed: true,
      certificateSent: false,
      answers: quizAnswers,
      attemptDate: now,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    } as never);
    console.log(`✓ Quiz result: ${totalQuestions}/${totalQuestions} passed`);
  }

  console.log("\nDone. User can log in and request certificate.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
