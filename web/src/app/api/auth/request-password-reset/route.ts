import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { auth } from "@/lib/auth";

const mongoClient = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017",
);

const COOLDOWN_PERIOD_MS = 60 * 1000; // 1 minute cooldown

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const db = mongoClient.db();
    const usersCollection = db.collection("user");
    const cooldownCollection = db.collection("password_reset_cooldown");

    // Find the user first to check cooldown
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        success: true,
        emailSent: false,
        message:
          "Si un compte existe avec cette adresse, un email a été envoyé",
      });
    }

    // Check for cooldown
    const recentRequest = await cooldownCollection.findOne({
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - COOLDOWN_PERIOD_MS) },
    });

    if (recentRequest) {
      const timeRemaining = Math.ceil(
        (COOLDOWN_PERIOD_MS -
          (Date.now() - new Date(recentRequest.createdAt).getTime())) /
          1000,
      );

      return NextResponse.json({
        success: false,
        cooldown: true,
        timeRemaining,
        error: `Veuillez attendre ${timeRemaining} secondes avant de renvoyer un email`,
      });
    }

    // Use better-auth's API to request password reset
    // This will generate the token and call sendResetPassword
    try {
      await auth.api.requestPasswordReset({
        body: {
          email,
          redirectTo: "/forgot-password",
        },
      });

      // If we get here, the email was sent successfully
      // Record the cooldown
      await cooldownCollection.deleteMany({ email: email.toLowerCase() });
      await cooldownCollection.insertOne({
        email: email.toLowerCase(),
        createdAt: new Date(),
      });

      // Create TTL index if it doesn't exist (auto-cleanup old records)
      await cooldownCollection
        .createIndex({ createdAt: 1 }, { expireAfterSeconds: 300 })
        .catch(() => {
          // Index might already exist
        });

      return NextResponse.json({
        success: true,
        emailSent: true,
        message: "Email de réinitialisation envoyé avec succès",
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);

      return NextResponse.json({
        success: false,
        emailSent: false,
        error: "Échec de l'envoi de l'email. Veuillez réessayer plus tard.",
      });
    }
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 },
    );
  }
}
