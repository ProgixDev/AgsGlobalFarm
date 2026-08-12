import mongoose, { Schema, Document } from "mongoose";

export type FarmGeometryType = "point" | "polygon";
export type FarmArea = "less_1ha" | "1ha" | "2ha" | "other";
export type FarmType =
  | "maraicher"
  | "avicole"
  | "fruitier"
  | "elevage"
  | "agroecologie"
  | "cerealiculture"
  | "aquaculture"
  | "autre";

export interface FarmCoordinates {
  longitude: number;
  latitude: number;
}

export interface IFarm extends Document {
  userId: string;
  name: string;
  geometryType: FarmGeometryType;
  coordinates?: FarmCoordinates;
  boundaryCoordinates?: FarmCoordinates[];
  surfaceHectares?: number;
  area?: FarmArea;
  farmType?: FarmType;
  currentCrops?: string;
  contact?: string;
  hidePersonalInfo?: boolean;
  gpsCaptured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema<FarmCoordinates>(
  {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  { _id: false },
);

const FarmSchema = new Schema<IFarm>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    geometryType: {
      type: String,
      enum: ["point", "polygon"],
      required: true,
      default: "point",
    },
    coordinates: { type: CoordinatesSchema },
    boundaryCoordinates: { type: [CoordinatesSchema], default: undefined },
    surfaceHectares: { type: Number },
    area: {
      type: String,
      enum: ["less_1ha", "1ha", "2ha", "other"],
    },
    farmType: {
      type: String,
      enum: [
        "maraicher",
        "avicole",
        "fruitier",
        "elevage",
        "agroecologie",
        "cerealiculture",
        "aquaculture",
        "autre",
      ],
    },
    currentCrops: { type: String },
    contact: { type: String },
    hidePersonalInfo: { type: Boolean, default: false },
    gpsCaptured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Farm =
  (mongoose.models.Farm as mongoose.Model<IFarm>) ||
  mongoose.model<IFarm>("Farm", FarmSchema);

export default Farm;
