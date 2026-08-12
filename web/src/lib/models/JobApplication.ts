import mongoose, { Schema, Document } from "mongoose";

export type JobApplicationStatus =
  | "pending"
  | "reviewed"
  | "accepted"
  | "rejected";

export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: string;
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
  status: JobApplicationStatus;
  appliedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicantId: { type: String, required: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantPhone: { type: String, required: true },
    applicantAddress: { type: String },
    region: { type: String },
    department: { type: String },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    desiredPosition: { type: String, required: true },
    salaryExpectation: { type: String, required: true },
    coverLetter: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
JobApplicationSchema.index({ applicantId: 1, createdAt: -1 });
JobApplicationSchema.index({ jobId: 1, status: 1 });

const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);

export default JobApplication;
