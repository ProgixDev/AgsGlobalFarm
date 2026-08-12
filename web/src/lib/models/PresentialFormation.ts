import mongoose, { Schema, Document } from "mongoose";

export interface IPresentialFormation extends Document {
  title: string;
  description: string;
  image: string;
  durationDays: number;
  level: string;
  price: number;
  category: string;
  type: "presentiel";
  program: {
    name: string;
    timeFrames: {
      from: string;
      to: string;
      name: string;
      description?: string;
    }[];
  }[];
  sessions: {
    id: number;
    startDate: Date;
    endDate: Date;
    location: string;
    availableSpots: number;
    status: "open" | "ongoing" | "done";
    participants?: string[];
  }[];
  address: string;
  icon: string;
  maxParticipants?: number;
}

const TimeFrameSchema = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
  },
  { _id: false },
);

const DaySchema = new Schema(
  {
    name: { type: String, required: true },
    timeFrames: [TimeFrameSchema],
  },
  { _id: false },
);

const SessionSchema = new Schema(
  {
    id: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    availableSpots: { type: Number, required: true },
    status: { type: String, required: true, enum: ["open", "ongoing", "done"] },
    participants: { type: [String], required: false },
  },
  { _id: false },
);

const PresentialFormationSchema = new Schema<IPresentialFormation>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    durationDays: { type: Number, required: true },
    level: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    type: {
      type: String,
      required: true,
      default: "presentiel",
      enum: ["presentiel"],
    },
    program: { type: [DaySchema], required: true },
    sessions: { type: [SessionSchema], required: true },
    address: { type: String, required: true },
    icon: { type: String, required: true },
    maxParticipants: { type: Number, required: false },
  },
  {
    timestamps: true,
  },
);

const PresentialFormation =
  mongoose.models.PresentialFormation ||
  mongoose.model<IPresentialFormation>(
    "PresentialFormation",
    PresentialFormationSchema,
  );

export default PresentialFormation;
