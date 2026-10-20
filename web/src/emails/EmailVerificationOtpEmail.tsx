import { Heading, Text, Section, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface EmailVerificationOtpEmailProps {
  email: string;
  otp: string;
}

export default function EmailVerificationOtpEmail({
  email,
  otp,
}: EmailVerificationOtpEmailProps) {
  return (
    <EmailLayout previewText="Code de vérification de votre email">
      <Heading style={heading}>Vérifiez votre email</Heading>

      <Text style={text}>Bonjour,</Text>

      <Text style={text}>
        Bienvenue chez AGS Globalfarm. Pour activer votre compte associé à{" "}
        <strong>{email}</strong>, saisissez ce code dans l&apos;application :
      </Text>

      <Section style={otpContainer}>
        <Text style={otpText}>{otp}</Text>
      </Section>

      <Text style={text}>
        Ce code est valide pendant <strong>10 minutes</strong>. Si vous
        n&apos;avez pas créé de compte chez nous, vous pouvez ignorer cet email
        en toute sécurité.
      </Text>

      <Hr style={divider} />

      <Text style={textSmall}>
        Ne partagez jamais ce code avec qui que ce soit. Si vous rencontrez des
        difficultés, contactez notre support à contact@agsglobalfarm.com.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 24px",
  lineHeight: "32px",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const textSmall = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#6b7280",
  margin: "0 0 12px",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const otpContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const otpText = {
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "12px",
  color: "#059669",
  margin: "0",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};
