/**
 * Seeds job applications.
 * Idempotent: skips if (jobId, applicantId) pair already exists.
 * Applicant is seeded job_seeker (Amadou Diallo). Targets first 5 seeded jobs.
 *
 * Usage: bun run scripts/seed-job-applications.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import mongoose from "mongoose";
import JobModel from "../src/lib/models/Job";
import JobApplicationModel from "../src/lib/models/JobApplication";

const APPLICANT_EMAIL = "amadou.diallo@example.com";

const APPLICATION_TEMPLATES = [
  {
    education: "BTS Agronomie",
    experience:
      "3 ans d'expérience en maraîchage et conduite de tracteur sur ferme familiale.",
    desiredPosition: "Ouvrier agricole",
    salaryExpectation: "200 000 FCFA/mois",
    coverLetter:
      "Je suis passionné par l'agriculture et motivé à rejoindre votre équipe. Mon expérience en maraîchage me permettra d'être opérationnel rapidement.",
    status: "pending" as const,
  },
  {
    education: "Licence Production Végétale",
    experience: "2 ans en production sous serre, gestion d'équipe de 5 personnes.",
    desiredPosition: "Technicien horticole",
    salaryExpectation: "300 000 FCFA/mois",
    status: "reviewed" as const,
  },
  {
    education: "Master Agronomie",
    experience:
      "5 ans en gestion de cultures maraîchères. Expert irrigation goutte-à-goutte.",
    desiredPosition: "Chef de culture",
    salaryExpectation: "450 000 FCFA/mois",
    coverLetter:
      "Mon parcours et mes compétences correspondent parfaitement au profil recherché.",
    status: "accepted" as const,
  },
  {
    education: "BFEM",
    experience: "Travaux saisonniers récolte mangues à Ziguinchor.",
    desiredPosition: "Ouvrier saisonnier",
    salaryExpectation: "120 000 FCFA/mois",
    status: "pending" as const,
  },
  {
    education: "CAP Mécanique Agricole",
    experience: "4 ans conducteur tracteur, entretien moteurs.",
    desiredPosition: "Conducteur de tracteur",
    salaryExpectation: "300 000 FCFA/mois",
    status: "rejected" as const,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) throw new Error("DB unavailable");

  const applicant = await db
    .collection("user")
    .findOne({ email: APPLICANT_EMAIL });
  if (!applicant) {
    console.error(
      `Applicant ${APPLICANT_EMAIL} not found. Run seed-test-users.ts first.`,
    );
    process.exit(1);
  }
  const applicantId = String(applicant.id ?? applicant._id);
  console.log(`Using applicant id: ${applicantId}`);

  const jobs = await JobModel.find({})
    .sort({ createdAt: 1 })
    .limit(APPLICATION_TEMPLATES.length)
    .lean();

  if (jobs.length === 0) {
    console.error("No jobs found. Run seed-jobs.ts first.");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  for (let i = 0; i < jobs.length && i < APPLICATION_TEMPLATES.length; i += 1) {
    const job = jobs[i];
    const tpl = APPLICATION_TEMPLATES[i];
    const jobId = job._id;

    const existing = await JobApplicationModel.findOne({
      jobId,
      applicantId,
    });
    if (existing) {
      skipped += 1;
      console.log(`- Skipped existing application for ${job.title}`);
      continue;
    }

    await JobApplicationModel.create({
      jobId,
      applicantId,
      applicantName: `${applicant.firstName ?? "Amadou"} ${
        applicant.lastName ?? "Diallo"
      }`,
      applicantEmail: applicant.email,
      applicantPhone: applicant.phone ?? "771234567",
      applicantAddress: "Quartier Liberté 6, Dakar",
      region: "Dakar",
      department: "Dakar",
      education: tpl.education,
      experience: tpl.experience,
      desiredPosition: tpl.desiredPosition,
      salaryExpectation: tpl.salaryExpectation,
      coverLetter: tpl.coverLetter,
      status: tpl.status,
      appliedDate: new Date(),
    });
    await JobModel.updateOne({ _id: jobId }, { $inc: { applicantsCount: 1 } });
    created += 1;
    console.log(`✓ Created application for ${job.title} (status=${tpl.status})`);
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
