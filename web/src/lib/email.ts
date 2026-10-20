import nodemailer from "nodemailer";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ReactElement } from "react";
import type { EmailAttachment } from "@/types";

interface EmailOptions {
  to: string;
  subject: string;
  template: ReactElement;
  attachments?: EmailAttachment[];
}

// Resend is used when RESEND_API_KEY is set; otherwise fall back to SMTP.
const useResend = Boolean(process.env.RESEND_API_KEY);

// Validate email configuration
if (!useResend && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
  console.error("⚠️ Email configuration missing!");
  console.error(
    "Add RESEND_API_KEY (preferred) or EMAIL_USER and EMAIL_PASSWORD to your .env.local file",
  );
  console.error("See docs/QUICKSTART.md for setup instructions");
}

function fromHeader() {
  const name = process.env.EMAIL_FROM_NAME || "AGS Globalfarm SARL";
  const address = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
  return `"${name}" <${address}>`;
}

async function sendWithResend(
  to: string,
  subject: string,
  html: string,
  attachments: EmailAttachment[] | undefined,
) {
  if (!process.env.EMAIL_FROM_ADDRESS) {
    throw new Error(
      "EMAIL_FROM_ADDRESS is required with Resend (e.g. noreply@agsglobalfarm.com)",
    );
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: fromHeader(),
    to,
    subject,
    html,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.content),
    })),
  });
  // Resend returns errors instead of throwing; surface them so callers
  // (OTP, password reset) fail loudly rather than silently losing the email.
  if (error) throw new Error(`Resend error: ${error.name}: ${error.message}`);
  return data?.id;
}

/**
 * Create a fresh transporter for each email (prevents stale connections in serverless)
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

/**
 * Send email using React component template
 */
export async function sendEmail({
  to,
  subject,
  template,
  attachments,
}: EmailOptions) {
  // Check if credentials are configured
  if (!useResend && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    const errorMsg = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  EMAIL CONFIGURATION MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please configure email settings in your .env.local file:

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

📖 See docs/QUICKSTART.md for detailed setup instructions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    console.error(errorMsg);
    throw new Error("Email credentials not configured. Check .env.local file.");
  }

  try {
    // Render React component to HTML
    const html = await render(template);

    if (useResend) {
      const id = await sendWithResend(to, subject, html, attachments);
      console.log("✅ Email sent successfully (Resend):", id);
      return { success: true, messageId: id };
    }

    // Create fresh transporter for this email
    const transporter = createTransporter();

    // Send email
    const info = await transporter.sendMail({
      from: fromHeader(),
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content),
        contentType: a.contentType,
      })),
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("Missing credentials")) {
        console.error(
          "\n💡 Tip: Check that EMAIL_USER and EMAIL_PASSWORD are set in .env.local",
        );
      } else if (error.message.includes("Invalid login")) {
        console.error(
          "\n💡 Tip: For Gmail, use an App Password, not your account password",
        );
        console.error(
          "   Generate one at: https://myaccount.google.com/apppasswords",
        );
      }
    }

    throw error;
  }
}

/**
 * Verify email transporter configuration
 */
export async function verifyEmailConfig() {
  if (useResend) return Boolean(process.env.EMAIL_FROM_ADDRESS);
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email server is ready to send emails");
    return true;
  } catch (error) {
    console.error("❌ Email server verification failed:", error);
    return false;
  }
}
