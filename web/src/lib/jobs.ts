import mongoose from "mongoose";
import { connectToDatabase } from "./db";
import JobModel from "./models/Job";
import JobApplicationModel from "./models/JobApplication";
import { sendEmail } from "./email";
import ApplicationStatusEmail from "@/emails/ApplicationStatusEmail";
import type { Job, JobApplication, JobApplicationStatus } from "@/types";

export interface JobsQuery {
  region?: string;
  department?: string;
  contractType?: string;
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function listJobs(
  params: JobsQuery = {},
): Promise<{ jobs: Job[]; total: number }> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  else filter.status = "active";
  if (params.region) filter.region = params.region;
  if (params.department) filter.department = params.department;
  if (params.contractType) filter.contractType = params.contractType;
  if (params.q && params.q.trim()) {
    const regex = new RegExp(
      params.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    filter.$or = [
      { title: regex },
      { farmName: regex },
      { description: regex },
      { location: regex },
    ];
  }

  const limit = Math.min(Math.max(params.limit ?? 100, 1), 200);
  const offset = Math.max(params.offset ?? 0, 0);

  const total = await JobModel.countDocuments(filter);
  const jobs = await JobModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  return { jobs: jobs as unknown as Job[], total };
}

export async function listMyJobs(userId: string): Promise<Job[]> {
  await connectToDatabase();
  const jobs = await JobModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .lean();
  return jobs as unknown as Job[];
}

export async function getJobByIdHelper(id: string): Promise<Job | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectToDatabase();
  const job = await JobModel.findById(id).lean();
  return job ? (job as unknown as Job) : null;
}

export async function createJob(
  userId: string,
  data: Partial<Job>,
): Promise<Job> {
  await connectToDatabase();
  const job = await JobModel.create({
    ...data,
    createdBy: userId,
    applicantsCount: 0,
    postedDate: new Date(),
    status: data.status ?? "active",
  });
  return job.toObject() as Job;
}

export async function updateJob(
  id: string,
  userId: string,
  data: Partial<Job>,
): Promise<{ ok: boolean; status: number; job?: Job; error?: string }> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();
  const existing = await JobModel.findById(id);
  if (!existing) return { ok: false, status: 404, error: "Offre introuvable" };
  if (existing.createdBy !== userId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }
  Object.assign(existing, data);
  await existing.save();
  return { ok: true, status: 200, job: existing.toObject() as Job };
}

export async function deleteJob(
  id: string,
  userId: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();
  const existing = await JobModel.findById(id);
  if (!existing) return { ok: false, status: 404, error: "Offre introuvable" };
  if (existing.createdBy !== userId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }
  await JobModel.deleteOne({ _id: id });
  await JobApplicationModel.deleteMany({ jobId: id });
  return { ok: true, status: 200 };
}

export async function setJobStatus(
  id: string,
  userId: string,
  status: string,
): Promise<{ ok: boolean; status: number; job?: Job; error?: string }> {
  const allowed = ["active", "paused", "closed", "expired"];
  if (!allowed.includes(status)) {
    return { ok: false, status: 400, error: "Statut invalide" };
  }
  return updateJob(id, userId, { status: status as Job["status"] });
}

export interface ApplyJobInput {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress?: string;
  region?: string;
  department?: string;
  education: string;
  experience: string;
  desiredPosition: string;
  salaryExpectation: string;
  coverLetter?: string;
}

export async function applyToJob(
  jobId: string,
  applicantId: string,
  data: ApplyJobInput,
): Promise<{
  ok: boolean;
  status: number;
  application?: JobApplication;
  error?: string;
}> {
  if (!mongoose.isValidObjectId(jobId)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();

  const job = await JobModel.findById(jobId);
  if (!job) return { ok: false, status: 404, error: "Offre introuvable" };
  if (job.status !== "active") {
    return { ok: false, status: 400, error: "Offre non disponible" };
  }

  const existing = await JobApplicationModel.findOne({
    jobId,
    applicantId,
  });
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: "Vous avez déjà postulé à cette offre",
    };
  }

  const application = await JobApplicationModel.create({
    jobId,
    applicantId,
    ...data,
    appliedDate: new Date(),
    status: "pending",
  });

  await JobModel.updateOne({ _id: jobId }, { $inc: { applicantsCount: 1 } });

  return {
    ok: true,
    status: 201,
    application: application.toObject() as JobApplication,
  };
}

export async function listApplicationsForJob(
  jobId: string,
  ownerId: string,
): Promise<{
  ok: boolean;
  status: number;
  applications?: JobApplication[];
  error?: string;
}> {
  if (!mongoose.isValidObjectId(jobId)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();
  const job = await JobModel.findById(jobId);
  if (!job) return { ok: false, status: 404, error: "Offre introuvable" };
  if (job.createdBy !== ownerId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }
  const applications = await JobApplicationModel.find({ jobId })
    .sort({ createdAt: -1 })
    .lean();
  return {
    ok: true,
    status: 200,
    applications: applications as unknown as JobApplication[],
  };
}

export async function listMyApplications(
  applicantId: string,
): Promise<JobApplication[]> {
  await connectToDatabase();
  const applications = await JobApplicationModel.find({ applicantId })
    .sort({ createdAt: -1 })
    .lean();
  return applications as unknown as JobApplication[];
}

export async function setApplicationStatus(
  applicationId: string,
  ownerId: string,
  status: JobApplicationStatus,
  message?: string,
): Promise<{
  ok: boolean;
  status: number;
  application?: JobApplication;
  error?: string;
}> {
  const allowed: JobApplicationStatus[] = [
    "pending",
    "reviewed",
    "accepted",
    "rejected",
  ];
  if (!allowed.includes(status)) {
    return { ok: false, status: 400, error: "Statut invalide" };
  }
  if (!mongoose.isValidObjectId(applicationId)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }

  await connectToDatabase();
  const application = await JobApplicationModel.findById(applicationId);
  if (!application) {
    return { ok: false, status: 404, error: "Candidature introuvable" };
  }
  const job = await JobModel.findById(application.jobId);
  if (!job) {
    return { ok: false, status: 404, error: "Offre introuvable" };
  }
  if (job.createdBy !== ownerId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }

  application.status = status;
  await application.save();

  if (status === "accepted" || status === "rejected") {
    try {
      await sendEmail({
        to: application.applicantEmail,
        subject: `Votre candidature: ${
          status === "accepted" ? "Acceptée" : "Mise à jour"
        } - ${job.title}`,
        template: ApplicationStatusEmail({
          applicantName: application.applicantName,
          jobTitle: job.title,
          farmName: job.farmName,
          status,
          message,
        }),
      });
    } catch (err) {
      console.error("Failed to send application status email", err);
    }
  }

  return {
    ok: true,
    status: 200,
    application: application.toObject() as JobApplication,
  };
}
