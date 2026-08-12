import mongoose, { Schema, Document } from "mongoose";

export interface IFormationProgress extends Document {
  userId: string;
  formationId: string;
  completedLessons: string[]; // Format: "sectionId-lessonId"
  lastAccessedAt: Date;
}

const FormationProgressSchema = new Schema<IFormationProgress>(
  {
    userId: { type: String, required: true },
    formationId: { type: String, required: true },
    completedLessons: [{ type: String }],
    lastAccessedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure one progress record per user per formation
FormationProgressSchema.index({ userId: 1, formationId: 1 }, { unique: true });

const FormationProgress =
  mongoose.models.FormationProgress ||
  mongoose.model<IFormationProgress>(
    "FormationProgress",
    FormationProgressSchema,
  );

export default FormationProgress;
