import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockJobs, mockMyJobs, mockApplicants } from "@/data/mockJobs";

interface JobsStore {
  // All available jobs (for job seekers)
  allJobs: Job[];

  // User's posted jobs (for recruiters) - persisted
  myJobs: Job[];
  setMyJobs: (jobs: Job[]) => void;

  // Applications by job ID - persisted
  applications: Record<string, JobApplication[]>;

  // CRUD operations
  createJob: (job: Omit<Job, "id" | "postedDate" | "applicantsCount">) => void;
  updateJob: (id: string, job: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  duplicateJob: (id: string) => void;
  getJobById: (id: string) => Job | undefined;

  // Application operations
  submitApplication: (
    application: Omit<JobApplication, "id" | "appliedDate" | "status">,
  ) => void;
  updateApplicationStatus: (
    applicationId: string,
    jobId: string,
    status: "pending" | "reviewed" | "accepted" | "rejected",
  ) => void;
  getApplicationsByJobId: (jobId: string) => JobApplication[];
  getMyApplications: (applicantId: string) => JobApplication[];
  getAcceptedJobsForUser: (applicantId: string) => Job[];
  hasApplied: (jobId: string, applicantId: string) => boolean;
}

export const useJobsStore = create<JobsStore>()(
  persist(
    (set, get) => ({
      allJobs: mockJobs,
      myJobs: mockMyJobs,
      applications: mockApplicants,

      setMyJobs: (jobs: Job[]) => set({ myJobs: jobs }),

      createJob: (jobData) => {
        const newJob: Job = {
          ...jobData,
          id: `job-${Date.now()}`,
          postedDate: new Date().toISOString().split("T")[0],
          applicantsCount: 0,
        };
        set((state) => ({ myJobs: [newJob, ...state.myJobs] }));
      },

      updateJob: (id: string, jobData: Partial<Job>) => {
        set((state) => ({
          myJobs: state.myJobs.map((job) =>
            job.id === id ? { ...job, ...jobData } : job,
          ),
        }));
      },

      deleteJob: (id: string) => {
        set((state) => ({
          myJobs: state.myJobs.filter((job) => job.id !== id),
        }));
      },

      duplicateJob: (id: string) => {
        const jobToDuplicate = get().myJobs.find((job) => job.id === id);
        if (!jobToDuplicate) return;

        const newJob: Job = {
          ...jobToDuplicate,
          id: `job-${Date.now()}`,
          title: `${jobToDuplicate.title} (Copie)`,
          postedDate: new Date().toISOString().split("T")[0],
          applicantsCount: 0,
        };
        set((state) => ({ myJobs: [newJob, ...state.myJobs] }));
      },

      getJobById: (id: string) => {
        const state = get();
        return (
          state.myJobs.find((job) => job.id === id) ||
          state.allJobs.find((job) => job.id === id)
        );
      },

      submitApplication: (applicationData) => {
        const newApplication: JobApplication = {
          ...applicationData,
          id: `app-${Date.now()}`,
          appliedDate: new Date().toISOString().split("T")[0],
          status: "pending",
        };
        set((state) => {
          const existing = state.applications[applicationData.jobId] ?? [];
          return {
            applications: {
              ...state.applications,
              [applicationData.jobId]: [...existing, newApplication],
            },
          };
        });
      },

      updateApplicationStatus: (
        applicationId: string,
        jobId: string,
        status: "pending" | "reviewed" | "accepted" | "rejected",
      ) => {
        set((state) => {
          const jobApps = state.applications[jobId] ?? [];
          return {
            applications: {
              ...state.applications,
              [jobId]: jobApps.map((app) =>
                app.id === applicationId ? { ...app, status } : app,
              ),
            },
          };
        });
      },

      getApplicationsByJobId: (jobId: string) => {
        return get().applications[jobId] ?? [];
      },

      getMyApplications: (applicantId: string) => {
        return Object.values(get().applications)
          .flat()
          .filter((app) => app.applicantId === applicantId);
      },

      hasApplied: (jobId: string, applicantId: string) => {
        return (get().applications[jobId] ?? []).some(
          (app) => app.applicantId === applicantId,
        );
      },

      getAcceptedJobsForUser: (applicantId: string) => {
        const state = get();
        const acceptedJobIds = Object.entries(state.applications)
          .filter(([, apps]) =>
            apps.some(
              (app) =>
                app.applicantId === applicantId && app.status === "accepted",
            ),
          )
          .map(([jobId]) => jobId);

        return [...state.allJobs, ...state.myJobs].filter((job) =>
          acceptedJobIds.includes(job.id),
        );
      },
    }),
    {
      name: "@ags_jobs_storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        myJobs: state.myJobs,
        applications: state.applications,
      }),
    },
  ),
);
