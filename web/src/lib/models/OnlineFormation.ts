import mongoose, { Schema, Document } from "mongoose";

export interface IOnlineFormation extends Document {
  title: string;
  description: string;
  image: string;
  duration?: string;
  level: string;
  price: number;
  category: string;
  type: "online";
  sections: {
    id: number;
    title: string;
    lessons: {
      id: number;
      title: string;
      content?: string;
    }[];
  }[];
  quiz?: {
    sections: {
      id: number;
      title: string;
      questions: {
        id: number;
        question: string;
        image?: string;
        points: number;
        options: {
          id: string;
          text: string;
        }[];
        correctAnswer: string;
      }[];
    }[];
  };
  icon: string;
  owners?: {
    userId: string;
    purchaseDate: Date;
  }[];
}

const LessonSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    content: String,
  },
  { _id: false },
);

const SectionSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    lessons: [LessonSchema],
  },
  { _id: false },
);

const QuizOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const QuizQuestionSchema = new Schema(
  {
    id: { type: Number, required: true },
    question: { type: String, required: true },
    image: { type: String, required: false },
    points: { type: Number, required: true },
    options: [QuizOptionSchema],
    correctAnswer: { type: String, required: true },
  },
  { _id: false },
);

const QuizSectionSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    questions: [QuizQuestionSchema],
  },
  { _id: false },
);

const QuizSchema = new Schema(
  {
    sections: [QuizSectionSchema],
  },
  { _id: false },
);

const OnlineFormationSchema = new Schema<IOnlineFormation>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    duration: { type: String, required: false },
    level: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true, default: "online", enum: ["online"] },
    sections: { type: [SectionSchema], required: true },
    quiz: { type: QuizSchema, required: false },
    icon: { type: String, required: true },
    owners: {
      type: [
        new Schema(
          {
            userId: { type: String, required: true },
            purchaseDate: { type: Date, required: true },
          },
          { _id: false },
        ),
      ],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const OnlineFormation =
  mongoose.models.OnlineFormation ||
  mongoose.model<IOnlineFormation>("OnlineFormation", OnlineFormationSchema);

export default OnlineFormation;
