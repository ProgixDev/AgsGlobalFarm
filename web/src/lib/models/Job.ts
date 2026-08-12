import mongoose, { Schema, Document } from "mongoose";

export type JobContractType = "CDI" | "CDD" | "Saisonnier" | "Stage";
export type JobStatus = "active" | "paused" | "closed" | "expired";

export interface IJob extends Document {
  title: string;
  farmName: string;
  location: string;
  region: string;
  department: string;
  contractType: JobContractType;
  salaryRange: string;
  description: string;
  requirements: string[];
  applicantsCount: number;
  status: JobStatus;
  createdBy: string;
  postedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    farmName: { type: String, required: true },
    location: { type: String, required: true },
    region: { type: String, required: true, index: true },
    department: { type: String, required: true, index: true },
    contractType: {
      type: String,
      required: true,
      enum: ["CDI", "CDD", "Saisonnier", "Stage"],
    },
    salaryRange: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    applicantsCount: { type: Number, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["active", "paused", "closed", "expired"],
      default: "active",
      index: true,
    },
    createdBy: { type: String, required: true, index: true },
    postedDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

JobSchema.index({
  title: "text",
  farmName: "text",
  description: "text",
  location: "text",
});

const Job =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
