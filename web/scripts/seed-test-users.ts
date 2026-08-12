/**
 * Seeds 2 dev test accounts via better-auth signUp endpoint.
 * Idempotent: skips if user already exists.
 *
 * Usage: bun run scripts/seed-test-users.ts
 */
import "dotenv/config";

const BASE_URL =
  process.env.BETTER_AUTH_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const TEST_USERS = [
  {
    name: "Amadou Diallo",
    firstName: "Amadou",
    lastName: "Diallo",
    email: "amadou.diallo@example.com",
    password: "password123",
    phone: "771234567",
    gender: "male" as const,
    role: "job_seeker" as const,
  },
  {
    name: "Fatou Ndiaye",
    firstName: "Fatou",
    lastName: "Ndiaye",
    email: "fatou.ndiaye@example.com",
    password: "password123",
    phone: "781234567",
    gender: "female" as const,
    role: "farm_owner" as const,
  },
];

async function seed() {
  for (const user of TEST_USERS) {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      console.log(`✓ Created ${user.email} (${user.role})`);
    } else {
      const body = await res.text();
      if (body.includes("USER_ALREADY_EXISTS") || res.status === 422) {
        console.log(`- Skipped ${user.email} (already exists)`);
      } else {
        console.error(`✗ Failed ${user.email}: ${res.status} ${body}`);
      }
    }
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
