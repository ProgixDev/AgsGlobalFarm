/**
 * Directly inserts sikhou07@gmail.com into MongoDB and enrolls in all online formations.
 * Idempotent: skips if user/enrollment already exists.
 *
 * Usage: bun run scripts/seed-sikhou-user.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { MongoClient } from "mongodb";
import { hashPassword } from "@better-auth/utils/password";
import { nanoid } from "nanoid";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const USER = {
  firstName: "Sikhou",
  lastName: "Diallo",
  email: "sikhou07@gmail.com",
  password: "sikhou07",
  phone: "770000007",
  gender: "male",
  role: "job_seeker",
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("Connected to MongoDB\n");

  const db = client.db();
  const users = db.collection("user");
  const accounts = db.collection("account");
  const formations = db.collection("onlineformations");

  // 1. Create user if not exists
  let user = await users.findOne({ email: USER.email });
  let userId: string;

  if (user) {
    // better-auth stores _id as string (nanoid), so _id IS the userId string
    userId = user._id as string;
    console.log(`- User already exists (id: ${userId})`);
  } else {
    const now = new Date();
    // Must use nanoid string as _id — better-auth does $lookup joining user._id with account.userId
    // If _id is ObjectId (MongoDB default) the type mismatch breaks the join
    userId = nanoid();
    const newUser = {
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
    };
    await users.insertOne(newUser as never);
    console.log(`✓ Created user ${USER.email} (id: ${userId})`);

    // 2. Create credential account with hashed password
    const passwordHash = await hashPassword(USER.password);
    await accounts.insertOne({
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✓ Created account with hashed password`);
  }

  // 3. Enroll in all online formations
  console.log("\nEnrolling in online formations...");
  const allFormations = await formations.find({}).toArray();

  if (!allFormations.length) {
    console.log("! No online formations found. Run seed-formations-online.ts first.");
    await client.close();
    return;
  }

  for (const formation of allFormations) {
    const owners: { userId: string }[] = formation.owners || [];
    const alreadyOwner = owners.some((o) => o.userId === userId);

    if (alreadyOwner) {
      console.log(`- Already enrolled: "${formation.title}"`);
      continue;
    }

    await formations.updateOne(
      { _id: formation._id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { $push: { owners: { userId, purchaseDate: new Date() } } } as any
    );
    console.log(`✓ Enrolled: "${formation.title}"`);
  }

  console.log("\nDone.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
