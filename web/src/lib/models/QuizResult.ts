import mongoose, { Schema, Document } from "mongoose";

export interface IQuizResult extends Document {
  userId: string;
  formationId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  certificateSent: boolean;
  answers: {
    sectionId: number;
    questionId: number;
    selectedAnswer: string;
    correct: boolean;
  }[];
  attemptDate: Date;
  completedAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>(
  {
    userId: { type: String, required: true },
    formationId: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    certificateSent: { type: Boolean, default: false },
    answers: [
      {
        sectionId: { type: Number, required: true },
        questionId: { type: Number, required: true },
        selectedAnswer: { type: String, required: true },
        correct: { type: Boolean, required: true },
      },
    ],
    attemptDate: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

QuizResultSchema.index({ userId: 1, formationId: 1 });

const QuizResult =
  mongoose.models.QuizResult ||
  mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);

export default QuizResult;
