/**
 * Fixes sikhou07@gmail.com: deletes old broken record, recreates with proper nanoid _id.
 * Usage: npx tsx scripts/fix-sikhou-user.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { MongoClient } from "mongodb";
import { hashPassword } from "@better-auth/utils/password";
import { nanoid } from "nanoid";

const MONGODB_URI = process.env.MONGODB_URI!;
const EMAIL = "sikhou07@gmail.com";

const USER = {
  firstName: "Sikhou",
  lastName: "Diallo",
  email: EMAIL,
  password: "sikhou07",
  phone: "770000007",
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

  // 1. Clean up old broken record
  const existing = await users.findOne({ email: EMAIL });
  if (existing) {
    const oldId = existing._id?.toString();
    await accounts.deleteMany({ userId: oldId });
    await users.deleteOne({ email: EMAIL });
    await formations.updateMany({} as never, { $pull: { owners: { userId: oldId } } } as never);
    console.log(`Cleaned up old user (old id: ${oldId})`);
  }

  // 2. Create user with nanoid string _id (same as better-auth does)
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

  // 3. Create credential account
  const passwordHash = await hashPassword(USER.password);
  await accounts.insertOne({
    _id: nanoid(),
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  } as never);
  console.log(`✓ Created credential account`);

  // 4. Enroll in all online formations
  const allFormations = await formations.find({}).toArray();
  console.log(`\nEnrolling in ${allFormations.length} formation(s)...`);
  for (const f of allFormations) {
    await formations.updateOne(
      { _id: f._id },
      { $push: { owners: { userId, purchaseDate: now } } } as never
    );
    console.log(`✓ Enrolled: "${f.title}"`);
  }

  console.log("\nDone.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
