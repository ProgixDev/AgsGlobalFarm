"use server";

import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type {
  Product,
  Order,
  FormationProgress,
  QuizResult,
  OnlineFormation,
  PresentialFormation,
  FormationSession,
  QuizSection,
  QuizQuestion,
  Section,
  ContactFormData,
} from "@/types";
import OnlineFormationModel from "./models/OnlineFormation";
import PresentialFormationModel from "./models/PresentialFormation";
import ProductModel, { IProduct } from "./models/Product";
import OrderModel, { IOrder } from "./models/Order";
import FormationProgressModel from "./models/FormationProgress";
import QuizResultModel from "./models/QuizResult";
import { generateCertificatePdf } from "./certificate";
import { sendEmail } from "./email";
import ContactEmail from "@/emails/ContactEmail";
import CertificateEmail from "@/emails/CertificateEmail";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

const PASSING_THRESHOLD = 0.7;
const MAX_DAILY_ATTEMPTS = 3;

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB with Mongoose");
    }
    return mongoose.connection.db;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

// Orders

export async function getUserOrders(): Promise<Order[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];
    await connectToDatabase();
    const orders = await OrderModel.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });
    return orders.map((order: IOrder) => order.toObject() as Order);
  } catch (error) {
    console.error("Failed to fetch user orders", error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    await connectToDatabase();
    const order = await OrderModel.findOne({
      _id: orderId,
      userId: session.user.id,
    }).lean();
    return order ? (order as unknown as Order) : null;
  } catch (error) {
    console.error("Failed to fetch order", error);
    return null;
  }
}

// Products

export type ShopCategoryFilter =
  | "engrais"
  | "phyto"
  | "semence"
  | "petit_materiel";

export type ProductSort = "none" | "price_asc" | "price_desc";

export interface ProductsQuery {
  category?: ShopCategoryFilter;
  q?: string;
  sort?: ProductSort;
  limit?: number;
  offset?: number;
}

export async function getProducts(
  params: ProductsQuery = {},
): Promise<{ products: Product[]; total: number }> {
  try {
    await connectToDatabase();
    const { category, q, sort = "none", limit = 100, offset = 0 } = params;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (q && q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: regex },
        { shortDescription: regex },
        { longDescription: regex },
        { brand: regex },
      ];
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { priceTTC: 1 };
    else if (sort === "price_desc") sortObj = { priceTTC: -1 };

    const total = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .lean();

    return {
      products: products.map((p) => ({
        ...(p as unknown as Product),
      })),
      total,
    };
  } catch (error) {
    console.error("Failed to fetch products", error);
    return { products: [], total: 0 };
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    await connectToDatabase();
    const product = await ProductModel.findOne({ id }).lean();
    if (!product) return null;
    return product as unknown as Product;
  } catch (error) {
    console.error("Failed to fetch product", error);
    return null;
  }
}

// Formations

export async function getPublicOnlineFormations(): Promise<OnlineFormation[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    await connectToDatabase();

    // Fetch online formations with sections field to calculate stats, exclude quiz
    const onlineFormations = await OnlineFormationModel.find({})
      .select("-quiz")
      .lean();

    // If user is logged in, check ownership
    if (userId) {
      return onlineFormations.map((formation: OnlineFormation) => {
        const { owners, sections, ...rest } = formation;
        const totalSections = sections?.length || 0;
        const totalLessons =
          sections?.reduce(
            (sum: number, section: Section) =>
              sum + (section.lessons?.length || 0),
            0,
          ) || 0;

        return {
          ...rest,
          type: "online" as const,
          owned: isOwnerWithinAccessWindow(owners, userId),
          stats: {
            totalSections,
            totalLessons,
          },
        };
      });
    }

    // If not logged in, just remove sensitive fields but include stats
    return onlineFormations.map((formation: OnlineFormation) => {
      const { sections, ...rest } = formation;
      const totalSections = sections?.length || 0;
      const totalLessons =
        sections?.reduce(
          (sum: number, section) => sum + (section.lessons?.length || 0),
          0,
        ) || 0;

      return {
        ...rest,
        type: "online" as const,
        stats: {
          totalSections,
          totalLessons,
        },
      };
    }) as OnlineFormation[];
  } catch (error) {
    console.error("Failed to fetch online formations", error);
    return [];
  }
}

export async function getPublicPresentialFormations(): Promise<
  PresentialFormation[]
> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  try {
    await connectToDatabase();

    // Fetch presential formations and transform sessions
    const presentialFormations = (await PresentialFormationModel.find(
      {},
    ).lean()) as PresentialFormation[];

    // Transform presential formations to remove participants and add reservedSpots and owned
    const transformedPresential = presentialFormations.map((formation) => {
      const { sessions, ...rest } = formation;

      // Check if user is enrolled in any session
      const isEnrolledInAnySession = userId
        ? sessions?.some((session) => session.participants?.includes(userId)) ||
          false
        : false;

      const transformedSessions = sessions?.map((session) => {
        const { participants, ...sessionRest } = session;
        return {
          ...sessionRest,
          reservedSpots: participants?.length || 0,
          owned: userId ? participants?.includes(userId) || false : false,
        };
      });

      return {
        ...rest,
        type: "presentiel" as const,
        owned: isEnrolledInAnySession,
        sessions: transformedSessions,
      };
    });

    return transformedPresential as PresentialFormation[];
  } catch (error) {
    console.error("Failed to fetch presential formations", error);
    return [];
  }
}

export async function getOnlineFormationById(
  formationId: string,
): Promise<OnlineFormation | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    await connectToDatabase();

    const formation = await OnlineFormationModel.findById(formationId)
      .select("-quiz")
      .lean();

    if (!formation) return null;

    const { owners, sections, ...rest } = formation as OnlineFormation;
    const totalSections = sections?.length || 0;
    const totalLessons =
      sections?.reduce(
        (sum: number, section: Section) =>
          sum + (section.lessons?.length || 0),
        0,
      ) || 0;

    const owned = userId ? isOwnerWithinAccessWindow(owners, userId) : false;

    return {
      ...rest,
      type: "online" as const,
      sections: owned ? sections : undefined,
      owned,
      stats: { totalSections, totalLessons },
    } as OnlineFormation;
  } catch (error) {
    console.error("Failed to fetch online formation", error);
    return null;
  }
}

export async function getPresentialFormationById(
  formationId: string,
): Promise<PresentialFormation | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    await connectToDatabase();

    const formation = (await PresentialFormationModel.findById(formationId)
      .lean()) as PresentialFormation | null;

    if (!formation) return null;

    const { sessions, ...rest } = formation;
    const isEnrolledInAnySession = userId
      ? sessions?.some((s) => s.participants?.includes(userId)) || false
      : false;

    const transformedSessions = sessions?.map((s) => {
      const { participants, ...sessionRest } = s;
      return {
        ...sessionRest,
        reservedSpots: participants?.length || 0,
        owned: userId ? participants?.includes(userId) || false : false,
      };
    });

    return {
      ...rest,
      type: "presentiel" as const,
      owned: isEnrolledInAnySession,
      sessions: transformedSessions,
    } as PresentialFormation;
  } catch (error) {
    console.error("Failed to fetch presential formation", error);
    return null;
  }
}

function isOwnerWithinAccessWindow(
  owners: { userId: string; purchaseDate: Date }[] | undefined,
  userId: string,
): boolean {
  return owners?.some((o) => o.userId === userId) ?? false;
}

export async function getOwnedFormations(): Promise<{
  presential: PresentialFormation[];
  online: OnlineFormation[];
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { presential: [], online: [] };
    const userId = session.user.id;
    await connectToDatabase();

    // Get presential formations where user is in session participants
    const presentialFormations = await PresentialFormationModel.find({
      "sessions.participants": userId,
    }).lean();

    // Get online formations where user is in owners within 3-month window, exclude quiz
    const onlineFormations = await OnlineFormationModel.find({
      "owners.userId": userId,
    })
      .select("-quiz")
      .lean();

    // Transform presential formations to remove participants and add reservedSpots
    const transformedPresential = presentialFormations.map((formation) => {
      const { sessions, ...rest } = formation;
      return {
        ...rest,
        type: "presentiel" as const,
        sessions: sessions?.map((session: FormationSession) => {
          const { participants, ...sessionRest } = session;
          return {
            ...sessionRest,
            owned: participants?.includes(userId) || false,
          };
        }),
      };
    }) as PresentialFormation[];

    // Transform online formations: include all matched (no time window)
    const transformedOnline = onlineFormations.map((formation) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { owners, ...rest } = formation;
      return { ...rest, type: "online" as const };
    }) as OnlineFormation[];

    return {
      presential: transformedPresential,
      online: transformedOnline,
    };
  } catch (error) {
    console.error("Failed to fetch owned formations", error);
    return {
      presential: [],
      online: [],
    };
  }
}

export async function getFormationProgress(
  formationId: string,
): Promise<FormationProgress | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    await connectToDatabase();
    const progress = await FormationProgressModel.findOne({
      userId: session.user.id,
      formationId,
    });
    return progress ? (progress.toObject() as FormationProgress) : null;
  } catch (error) {
    console.error("Failed to fetch formation progress", error);
    return null;
  }
}

export async function updateFormationProgress(
  formationId: string,
  completedLessons: string[],
): Promise<FormationProgress | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    await connectToDatabase();
    const progress = await FormationProgressModel.findOneAndUpdate(
      { userId: session.user.id, formationId },
      {
        completedLessons,
        lastAccessedAt: new Date(),
      },
      { upsert: true, new: true },
    );
    return progress.toObject() as FormationProgress;
  } catch (error) {
    console.error("Failed to update formation progress", error);
    return null;
  }
}

// Quiz

export async function getQuizResult(
  formationId: string,
): Promise<QuizResult | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    await connectToDatabase();
    const result = await QuizResultModel.findOne({
      userId: session.user.id,
      formationId,
      passed: true,
    }).sort({ completedAt: -1 });
    return result ? (result.toObject() as QuizResult) : null;
  } catch (error) {
    console.error("Failed to fetch quiz result", error);
    return null;
  }
}

export async function saveQuizResult(data: {
  formationId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: {
    sectionId: number;
    questionId: number;
    selectedAnswer: string;
    correct: boolean;
  }[];
  attemptDate: Date;
}): Promise<QuizResult | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    await connectToDatabase();
    const result = await QuizResultModel.create({
      ...data,
      userId: session.user.id,
      completedAt: new Date(),
      attemptDate: data.attemptDate,
    });
    return result.toObject() as QuizResult;
  } catch (error) {
    console.error("Failed to save quiz result", error);
    return null;
  }
}

export async function markCertificateSent(
  formationId: string,
): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return false;
    await connectToDatabase();
    await QuizResultModel.updateOne(
      { userId: session.user.id, formationId, passed: true },
      { $set: { certificateSent: true } },
    );
    return true;
  } catch (error) {
    console.error("Failed to mark certificate sent", error);
    return false;
  }
}

export async function getFormationQuiz(
  formationId: string,
): Promise<QuizSection[] | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    const userId = session.user.id;
    await connectToDatabase();

    // Check if user owns the formation
    const formation = await OnlineFormationModel.findOne({
      _id: formationId,
      "owners.userId": userId,
    })
      .select("quiz sections owners")
      .lean();

    if (
      !formation ||
      !isOwnerWithinAccessWindow(
        formation.owners as { userId: string; purchaseDate: Date }[],
        userId,
      )
    ) {
      return null;
    }

    // Check if user completed all lessons
    const progress = await FormationProgressModel.findOne({
      userId,
      formationId,
    });

    const completedLessons = progress ? progress.completedLessons : [];
    const totalLessons =
      formation.sections?.reduce(
        (acc: number, section: Section) => acc + section.lessons.length,
        0,
      ) || 0;

    if (completedLessons.length < totalLessons) {
      return null;
    }

    // Return quiz without correct answers
    if (!formation.quiz?.sections) {
      return null;
    }

    const quizWithoutAnswers = formation.quiz.sections.map(
      (section: QuizSection) => ({
        id: section.id,
        title: section.title,
        questions: section.questions.map((question: QuizQuestion) => ({
          id: question.id,
          question: question.question,
          image: question.image,
          points: question.points,
          options: question.options,
        })),
      }),
    );

    return quizWithoutAnswers as QuizSection[];
  } catch (error) {
    console.error("Failed to fetch formation quiz", error);
    return null;
  }
}

export async function getQuizAttemptsToday(
  formationId: string,
): Promise<number> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return 0;
    const userId = session.user.id;
    await connectToDatabase();

    // Get start of today (00:00:00)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Count attempts made today
    const count = await QuizResultModel.countDocuments({
      userId,
      formationId,
      attemptDate: { $gte: startOfDay },
    });

    return count;
  } catch (error) {
    console.error("Failed to get quiz attempts today", error);
    return 0;
  }
}
// Contact

export async function sendContactEmail(formData: ContactFormData) {
  try {
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      return {
        success: false,
        error: "Tous les champs requis doivent être remplis.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        error: "Veuillez fournir une adresse email valide.",
      };
    }

    const adminEmail = process.env.STORE_EMAIL;
    if (!adminEmail) {
      console.error("STORE_EMAIL environment variable is not set");
      return {
        success: false,
        error:
          "Configuration email manquante. Veuillez contacter l'administrateur.",
      };
    }

    await sendEmail({
      to: adminEmail,
      subject: `Nouveau message de contact - ${formData.name}`,
      template: ContactEmail({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      }),
    });

    return {
      success: true,
      message:
        "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
    };
  } catch (error) {
    console.error("Error sending contact email:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer plus tard.",
    };
  }
}

// Formation actions

export async function getProgress(formationId: string) {
  try {
    const progress = await getFormationProgress(formationId);
    return {
      success: true,
      data: progress ? progress.completedLessons : [],
    };
  } catch (error) {
    console.error("Failed to get progress", error);
    return { success: false, error: "Failed to get progress" };
  }
}

export async function updateProgress(
  formationId: string,
  completedLessons: string[],
) {
  try {
    const { online: ownedOnlineFormations } = await getOwnedFormations();
    const ownsFormation = ownedOnlineFormations.some(
      (f) => f._id?.valueOf() === formationId,
    );

    if (!ownsFormation) {
      return { success: false, error: "You don't own this formation" };
    }

    const progress = await updateFormationProgress(
      formationId,
      completedLessons,
    );

    if (!progress) {
      return { success: false, error: "Failed to update progress" };
    }

    return {
      success: true,
      data: progress.completedLessons,
    };
  } catch (error) {
    console.error("Failed to update progress", error);
    return { success: false, error: "Failed to update progress" };
  }
}

export async function submitQuiz(
  formationId: string,
  answers: { questionId: number; selectedAnswer: string }[],
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Non authentifié" };
    const user = session.user as {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    const { online: ownedOnlineFormations } = await getOwnedFormations();
    const formation = ownedOnlineFormations.find(
      (f) => f._id?.valueOf() === formationId,
    );
    if (!formation) {
      return { success: false, error: "Formation introuvable" };
    }

    const existingPassedResult = await getQuizResult(formationId);
    if (existingPassedResult?.passed) {
      return { success: false, error: "Vous avez déjà réussi ce quiz" };
    }

    const attemptsToday = await getQuizAttemptsToday(formationId);
    if (attemptsToday >= MAX_DAILY_ATTEMPTS) {
      return {
        success: false,
        error: `Vous avez atteint la limite de ${MAX_DAILY_ATTEMPTS} tentatives par jour. Réessayez demain.`,
      };
    }

    const progress = await getFormationProgress(formationId);
    const completedLessons = progress ? progress.completedLessons : [];
    const totalLessons =
      formation.sections?.reduce(
        (acc, section) => acc + section.lessons.length,
        0,
      ) || 0;

    if (completedLessons.length < totalLessons) {
      return {
        success: false,
        error: "Vous devez terminer toutes les leçons avant de passer le quiz",
      };
    }

    await connectToDatabase();
    const formationWithQuiz = await OnlineFormationModel.findById(formationId)
      .select("quiz")
      .lean();

    if (!formationWithQuiz?.quiz?.sections) {
      return { success: false, error: "Quiz introuvable" };
    }

    const correctAnswersMap = new Map<
      number,
      { correctAnswer: string; sectionId: number }
    >();
    formationWithQuiz.quiz.sections.forEach((section: QuizSection) => {
      section.questions.forEach((question: QuizQuestion) => {
        correctAnswersMap.set(question.id, {
          correctAnswer: question.correctAnswer,
          sectionId: section.id,
        });
      });
    });

    const gradedAnswers = answers.map((answer) => {
      const questionData = correctAnswersMap.get(answer.questionId);
      return {
        sectionId: questionData?.sectionId || 0,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correct: answer.selectedAnswer === questionData?.correctAnswer,
      };
    });

    const score = gradedAnswers.filter((a) => a.correct).length;
    const totalQuestions = answers.length;
    const passed = score / totalQuestions >= PASSING_THRESHOLD;

    await saveQuizResult({
      formationId,
      score,
      totalQuestions,
      passed,
      answers: gradedAnswers,
      attemptDate: new Date(),
    });

    let certificateSent = false;

    if (passed) {
      try {
        const userName =
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

        const pdfBytes = await generateCertificatePdf({
          userName,
          formationTitle: formation.title,
          completionDate: new Date(),
        });

        await sendEmail({
          to: user.email,
          subject: `Votre certificat - ${formation.title}`,
          template: CertificateEmail({
            userName,
            formationTitle: formation.title,
            quizScore: score,
            totalQuestions,
          }),
          attachments: [
            {
              filename: `certificat-${formation.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
              content: pdfBytes,
              contentType: "application/pdf",
            },
          ],
        });

        await markCertificateSent(formationId);
        certificateSent = true;
      } catch (emailError) {
        console.error("Failed to send certificate email:", emailError);
      }
    }

    const detailedAnswers = gradedAnswers.map((answer) => ({
      sectionId: answer.sectionId,
      questionId: answer.questionId,
      correct: answer.correct,
    }));

    return {
      success: true,
      data: {
        score,
        total: totalQuestions,
        passed,
        certificateSent,
        answers: detailedAnswers,
      },
    };
  } catch (error) {
    console.error("Failed to submit quiz", error);
    return { success: false, error: "Erreur lors de la soumission du quiz" };
  }
}

export async function resendCertificate(formationId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Non authentifié" };
    const user = session.user as {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    const { online: ownedOnlineFormations } = await getOwnedFormations();
    const formation = ownedOnlineFormations.find(
      (f) => f._id?.valueOf() === formationId,
    );
    if (!formation) {
      return { success: false, error: "Formation introuvable" };
    }

    const quizResult = await getQuizResult(formationId);
    if (!quizResult?.passed) {
      return {
        success: false,
        error: "Vous devez réussir le quiz pour obtenir le certificat",
      };
    }

    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

    const pdfBytes = await generateCertificatePdf({
      userName,
      formationTitle: formation.title,
      completionDate: quizResult.completedAt
        ? new Date(quizResult.completedAt)
        : new Date(),
    });

    await sendEmail({
      to: user.email,
      subject: `Votre certificat - ${formation.title}`,
      template: CertificateEmail({
        userName,
        formationTitle: formation.title,
        quizScore: quizResult.score,
        totalQuestions: quizResult.totalQuestions,
      }),
      attachments: [
        {
          filename: `certificat-${formation.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
          content: pdfBytes,
          contentType: "application/pdf",
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Certificate resend error:", error);
    return {
      success: false,
      error: "Erreur lors de l'envoi du certificat",
    };
  }
}
