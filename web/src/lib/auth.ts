import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer, emailOTP, oneTimeToken } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { MongoClient } from "mongodb";
import { sendEmail } from "./email";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import PasswordResetOtpEmail from "@/emails/PasswordResetOtpEmail";
import EmailVerificationOtpEmail from "@/emails/EmailVerificationOtpEmail";
import { connectToDatabase } from "./db";
import FarmModel from "./models/Farm";
import IncidentModel from "./models/Incident";
import JobModel from "./models/Job";
import JobApplicationModel from "./models/JobApplication";
import FormationProgressModel from "./models/FormationProgress";
import QuizResultModel from "./models/QuizResult";

const mongoClient = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017",
);

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  baseURL: process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
  session: {
    expiresIn: THIRTY_DAYS,
    updateAge: 60 * 60 * 24,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const userRecord = user as {
        firstName?: string;
        lastName?: string;
        email: string;
      };
      const userName = userRecord.firstName
        ? `${userRecord.firstName} ${userRecord.lastName || ""}`.trim()
        : user.email;

      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe - GrowFarm",
        template: PasswordResetEmail({
          userName,
          resetUrl: url,
        }),
      });
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "agsmobile://",
  ],
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      gender: {
        type: ["male", "female", "other"],
        required: false,
      },
      phone: {
        type: "string",
        required: true,
      },
      role: {
        type: ["farm_owner", "job_seeker", "admin"],
        required: true,
        defaultValue: "job_seeker",
      },
    },
    fields: {
      name: "false",
    },
    deleteUser: {
      enabled: true,
      // Runs while the user record still exists, so cascade-deleting
      // everything keyed to their id here matches what the privacy policy
      // (/politique-de-confidentialite, /suppression-de-compte) promises is
      // erased on account deletion. Order records are deliberately excluded -
      // both pages state they're retained for accounting/tax purposes.
      beforeDelete: async (user) => {
        await connectToDatabase();
        const userId = user.id;
        const ownJobs = await JobModel.find({ createdBy: userId }, "_id");
        const ownJobIds = ownJobs.map((j) => j._id);

        await Promise.all([
          FarmModel.deleteMany({ userId }),
          IncidentModel.deleteMany({ reporterId: userId }),
          JobApplicationModel.deleteMany({ applicantId: userId }),
          FormationProgressModel.deleteMany({ userId }),
          QuizResultModel.deleteMany({ userId }),
          JobModel.deleteMany({ createdBy: userId }),
          ownJobIds.length
            ? JobApplicationModel.deleteMany({ jobId: { $in: ownJobIds } })
            : Promise.resolve(),
        ]);
      },
    },
  },
  plugins: [
    bearer(),
    expo(),
    oneTimeToken({
      expiresIn: 5,
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "forget-password") {
          await sendEmail({
            to: email,
            subject: "Code de réinitialisation - GrowFarm",
            template: PasswordResetOtpEmail({ email, otp }),
          });
          return;
        }
        if (type === "email-verification") {
          await sendEmail({
            to: email,
            subject: "Vérification de votre email - GrowFarm",
            template: EmailVerificationOtpEmail({ email, otp }),
          });
          return;
        }
      },
    }),
  ],
});
