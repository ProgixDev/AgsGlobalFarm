import { apiFetch } from "@/lib/api/client";

export interface JobsQuery {
  region?: string;
  department?: string;
  contractType?: string;
  q?: string;
  status?: string;
}

function buildQuery(params: JobsQuery): string {
  const search = new URLSearchParams();
  if (params.region) search.set("region", params.region);
  if (params.department) search.set("department", params.department);
  if (params.contractType) search.set("contractType", params.contractType);
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchJobs(
  params: JobsQuery = {},
): Promise<{ jobs: Job[]; total: number }> {
  return apiFetch(`/api/jobs${buildQuery(params)}`);
}

export async function fetchJobById(id: string): Promise<Job> {
  const data = await apiFetch<{ job: Job }>(
    `/api/jobs/${encodeURIComponent(id)}`,
  );
  return data.job;
}

export async function fetchMyJobs(): Promise<Job[]> {
  const data = await apiFetch<{ jobs: Job[] }>("/api/jobs/mine", {
    auth: true,
  });
  return data.jobs || [];
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  const result = await apiFetch<{ job: Job }>("/api/jobs", {
    method: "POST",
    body: data,
    auth: true,
  });
  return result.job;
}

export async function updateJob(
  id: string,
  data: Partial<Job>,
): Promise<Job> {
  const result = await apiFetch<{ job: Job }>(
    `/api/jobs/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: data,
      auth: true,
    },
  );
  return result.job;
}

export async function deleteJobApi(id: string): Promise<void> {
  await apiFetch(`/api/jobs/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function setJobStatusApi(
  id: string,
  status: JobStatus,
): Promise<Job> {
  const result = await apiFetch<{ job: Job }>(
    `/api/jobs/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: { status },
      auth: true,
    },
  );
  return result.job;
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
  data: ApplyJobInput,
): Promise<JobApplication> {
  const result = await apiFetch<{ application: JobApplication }>(
    `/api/jobs/${encodeURIComponent(jobId)}/apply`,
    {
      method: "POST",
      body: data,
      auth: true,
    },
  );
  return result.application;
}

export async function fetchJobApplications(
  jobId: string,
): Promise<JobApplication[]> {
  const data = await apiFetch<{ applications: JobApplication[] }>(
    `/api/jobs/${encodeURIComponent(jobId)}/applications`,
    { auth: true },
  );
  return data.applications || [];
}

export async function fetchMyApplications(): Promise<JobApplication[]> {
  const data = await apiFetch<{ applications: JobApplication[] }>(
    "/api/applications/mine",
    { auth: true },
  );
  return data.applications || [];
}

export async function setApplicationStatus(
  applicationId: string,
  status: JobApplication["status"],
  message?: string,
): Promise<JobApplication> {
  const result = await apiFetch<{ application: JobApplication }>(
    `/api/applications/${encodeURIComponent(applicationId)}`,
    {
      method: "PATCH",
      body: { status, message },
      auth: true,
    },
  );
  return result.application;
}
