import mongoose, { Schema, Document } from "mongoose";

export type IncidentCategory =
  | "crop_disease"
  | "pests"
  | "fire"
  | "flood"
  | "drought"
  | "locusts"
  | "storm"
  | "other";

export type IncidentSeverity = "low" | "medium" | "high";
export type IncidentStatus = "active" | "resolved";

export interface IncidentCoordinates {
  longitude: number;
  latitude: number;
}

export interface IIncident extends Document {
  reporterId: string;
  reporterName: string;
  category: IncidentCategory;
  customCategory?: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  coordinates: IncidentCoordinates;
  region?: string;
  images: string[];
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema<IncidentCoordinates>(
  {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  { _id: false },
);

const IncidentSchema = new Schema<IIncident>(
  {
    reporterId: { type: String, required: true, index: true },
    reporterName: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "crop_disease",
        "pests",
        "fire",
        "flood",
        "drought",
        "locusts",
        "storm",
        "other",
      ],
      required: true,
      index: true,
    },
    customCategory: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    coordinates: { type: CoordinatesSchema, required: true },
    region: { type: String, index: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const Incident =
  (mongoose.models.Incident as mongoose.Model<IIncident>) ||
  mongoose.model<IIncident>("Incident", IncidentSchema);

export default Incident;
