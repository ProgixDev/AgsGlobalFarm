import { Heading, Text, Button, Section, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Réinitialisation de votre mot de passe">
      <Heading style={heading}>Réinitialisation du mot de passe</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Vous avez demandé la réinitialisation de votre mot de passe pour votre
        compte AGS Globalfarm SARL.
      </Text>

      <Text style={text}>
        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Réinitialiser mon mot de passe
        </Button>
      </Section>

      <Text style={text}>
        Ce lien est valide pendant <strong>1 heure</strong>. Si vous n&apos;avez
        pas demandé cette réinitialisation, vous pouvez ignorer cet email en
        toute sécurité.
      </Text>

      <Hr style={divider} />

      <Text style={textSmall}>
        Pour votre sécurité, ne partagez jamais ce lien avec qui que ce soit. Si
        le bouton ne fonctionne pas, copiez et collez ce lien dans votre
        navigateur :
      </Text>

      <Text style={linkText}>{resetUrl}</Text>

      <Text style={textSmall}>
        Si vous rencontrez des difficultés, contactez notre support à
        contact@agsglobalfarm.com
      </Text>
    </EmailLayout>
  );
}

// Styles
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#059669",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "16px",
  display: "inline-block",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const linkText = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#3b82f6",
  wordBreak: "break-all" as const,
  margin: "8px 0 16px",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};
