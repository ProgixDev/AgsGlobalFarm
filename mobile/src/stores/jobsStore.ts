import { create } from "zustand";
import {
  fetchJobs,
  fetchJobById,
  fetchMyJobs,
  createJob as createJobApi,
  updateJob as updateJobApi,
  deleteJobApi,
  setJobStatusApi,
  applyToJob as applyToJobApi,
  fetchJobApplications,
  fetchMyApplications,
  setApplicationStatus as setApplicationStatusApi,
  type ApplyJobInput,
  type JobsQuery,
} from "@/lib/api/jobs";

type Status = "idle" | "loading" | "ready" | "error";

export function jobIdOf(job: Job | undefined | null): string {
  if (!job) return "";
  return (job._id || job.id || "") as string;
}

export function appIdOf(app: JobApplication): string {
  return (app._id || app.id || "") as string;
}

interface JobsStore {
  allJobs: Job[];
  allJobsStatus: Status;
  allJobsError: string | null;

  myJobs: Job[];
  myJobsStatus: Status;
  myJobsError: string | null;

  detailById: Record<string, Job>;
  applicationsByJobId: Record<string, JobApplication[]>;
  myApplications: JobApplication[];
  myApplicationsStatus: Status;

  loadAllJobs: (params?: JobsQuery) => Promise<void>;
  loadJobById: (id: string) => Promise<Job | null>;
  loadMyJobs: () => Promise<void>;
  createJob: (data: Partial<Job>) => Promise<Job | null>;
  updateJobAction: (id: string, data: Partial<Job>) => Promise<Job | null>;
  deleteJob: (id: string) => Promise<boolean>;
  setJobStatus: (id: string, status: JobStatus) => Promise<Job | null>;

  applyToJob: (
    jobId: string,
    data: ApplyJobInput,
  ) => Promise<{ ok: boolean; error?: string }>;
  loadJobApplications: (jobId: string) => Promise<JobApplication[]>;
  loadMyApplications: () => Promise<void>;
  updateApplicationStatus: (
    applicationId: string,
    jobId: string,
    status: JobApplication["status"],
    message?: string,
  ) => Promise<JobApplication | null>;

  getJobById: (id: string) => Job | undefined;
  getApplicationsByJobId: (jobId: string) => JobApplication[];
  hasApplied: (jobId: string) => boolean;
  getRecruiterActiveOffersCount: () => number;
  getRecruiterApplications: () => JobApplication[];
  getAcceptedJobsForUser: () => Job[];
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  allJobs: [],
  allJobsStatus: "idle",
  allJobsError: null,
  myJobs: [],
  myJobsStatus: "idle",
  myJobsError: null,
  detailById: {},
  applicationsByJobId: {},
  myApplications: [],
  myApplicationsStatus: "idle",

  loadAllJobs: async (params) => {
    set({ allJobsStatus: "loading", allJobsError: null });
    try {
      const { jobs } = await fetchJobs(params);
      set({ allJobs: jobs, allJobsStatus: "ready" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      set({ allJobsStatus: "error", allJobsError: message });
    }
  },

  loadJobById: async (id) => {
    try {
      const job = await fetchJobById(id);
      set((state) => ({
        detailById: { ...state.detailById, [jobIdOf(job)]: job },
      }));
      return job;
    } catch {
      return null;
    }
  },

  loadMyJobs: async () => {
    set({ myJobsStatus: "loading", myJobsError: null });
    try {
      const jobs = await fetchMyJobs();
      set({ myJobs: jobs, myJobsStatus: "ready" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      set({ myJobsStatus: "error", myJobsError: message });
    }
  },

  createJob: async (data) => {
    try {
      const job = await createJobApi(data);
      set((state) => ({ myJobs: [job, ...state.myJobs] }));
      return job;
    } catch (err) {
      console.warn("Failed to create job", err);
      return null;
    }
  },

  updateJobAction: async (id, data) => {
    try {
      const job = await updateJobApi(id, data);
      set((state) => ({
        myJobs: state.myJobs.map((j) => (jobIdOf(j) === id ? job : j)),
        allJobs: state.allJobs.map((j) => (jobIdOf(j) === id ? job : j)),
        detailById: { ...state.detailById, [id]: job },
      }));
      return job;
    } catch (err) {
      console.warn("Failed to update job", err);
      return null;
    }
  },

  deleteJob: async (id) => {
    try {
      await deleteJobApi(id);
      set((state) => ({
        myJobs: state.myJobs.filter((j) => jobIdOf(j) !== id),
        allJobs: state.allJobs.filter((j) => jobIdOf(j) !== id),
      }));
      return true;
    } catch (err) {
      console.warn("Failed to delete job", err);
      return false;
    }
  },

  setJobStatus: async (id, status) => {
    try {
      const job = await setJobStatusApi(id, status);
      set((state) => ({
        myJobs: state.myJobs.map((j) => (jobIdOf(j) === id ? job : j)),
        allJobs: state.allJobs.map((j) => (jobIdOf(j) === id ? job : j)),
      }));
      return job;
    } catch (err) {
      console.warn("Failed to set job status", err);
      return null;
    }
  },

  applyToJob: async (jobId, data) => {
    try {
      const application = await applyToJobApi(jobId, data);
      set((state) => ({
        myApplications: [application, ...state.myApplications],
        applicationsByJobId: {
          ...state.applicationsByJobId,
          [jobId]: [
            ...(state.applicationsByJobId[jobId] || []),
            application,
          ],
        },
        allJobs: state.allJobs.map((j) =>
          jobIdOf(j) === jobId
            ? { ...j, applicantsCount: (j.applicantsCount || 0) + 1 }
            : j,
        ),
      }));
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Échec de l'envoi";
      return { ok: false, error: message };
    }
  },

  loadJobApplications: async (jobId) => {
    try {
      const applications = await fetchJobApplications(jobId);
      set((state) => ({
        applicationsByJobId: {
          ...state.applicationsByJobId,
          [jobId]: applications,
        },
      }));
      return applications;
    } catch {
      return [];
    }
  },

  loadMyApplications: async () => {
    set({ myApplicationsStatus: "loading" });
    try {
      const applications = await fetchMyApplications();
      set({ myApplications: applications, myApplicationsStatus: "ready" });
    } catch {
      set({ myApplicationsStatus: "error" });
    }
  },

  updateApplicationStatus: async (applicationId, jobId, status, message) => {
    try {
      const application = await setApplicationStatusApi(
        applicationId,
        status,
        message,
      );
      set((state) => ({
        applicationsByJobId: {
          ...state.applicationsByJobId,
          [jobId]: (state.applicationsByJobId[jobId] || []).map((a) =>
            appIdOf(a) === applicationId ? application : a,
          ),
        },
        myApplications: state.myApplications.map((a) =>
          appIdOf(a) === applicationId ? application : a,
        ),
      }));
      return application;
    } catch (err) {
      console.warn("Failed to update application status", err);
      return null;
    }
  },

  getJobById: (id) => {
    const state = get();
    if (state.detailById[id]) return state.detailById[id];
    return (
      state.myJobs.find((j) => jobIdOf(j) === id) ||
      state.allJobs.find((j) => jobIdOf(j) === id)
    );
  },

  getApplicationsByJobId: (jobId) => {
    return get().applicationsByJobId[jobId] || [];
  },

  hasApplied: (jobId) => {
    return get().myApplications.some((a) => a.jobId === jobId);
  },

  getRecruiterActiveOffersCount: () => {
    return get().myJobs.filter((j) => j.status === "active").length;
  },

  getRecruiterApplications: () => {
    const myJobIds = new Set(get().myJobs.map(jobIdOf));
    const apps: JobApplication[] = [];
    Object.entries(get().applicationsByJobId).forEach(([jobId, list]) => {
      if (myJobIds.has(jobId)) apps.push(...list);
    });
    return apps;
  },

  getAcceptedJobsForUser: () => {
    const state = get();
    const acceptedJobIds = new Set(
      state.myApplications
        .filter((a) => a.status === "accepted")
        .map((a) => a.jobId),
    );
    return state.allJobs.filter((j) => acceptedJobIds.has(jobIdOf(j)));
  },
}));
