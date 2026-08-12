import { Heading, Text, Section, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface ApplicationStatusEmailProps {
  applicantName: string;
  jobTitle: string;
  farmName: string;
  status: "accepted" | "rejected" | "reviewed" | "pending";
  message?: string;
}

const statusLabels: Record<ApplicationStatusEmailProps["status"], string> = {
  accepted: "Acceptée",
  rejected: "Refusée",
  reviewed: "Examinée",
  pending: "En attente",
};

const statusColors: Record<ApplicationStatusEmailProps["status"], string> = {
  accepted: "#059669",
  rejected: "#dc2626",
  reviewed: "#2563eb",
  pending: "#6b7280",
};

export default function ApplicationStatusEmail({
  applicantName,
  jobTitle,
  farmName,
  status,
  message,
}: ApplicationStatusEmailProps) {
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";

  return (
    <EmailLayout previewText={`Votre candidature : ${statusLabels[status]}`}>
      <Heading style={heading}>
        {isAccepted
          ? "Félicitations !"
          : isRejected
            ? "Mise à jour de votre candidature"
            : "Mise à jour de votre candidature"}
      </Heading>

      <Text style={text}>Bonjour {applicantName},</Text>

      <Text style={text}>
        Votre candidature pour le poste <strong>{jobTitle}</strong> chez{" "}
        <strong>{farmName}</strong> a été mise à jour.
      </Text>

      <Section style={statusContainer}>
        <Text style={{ ...statusText, color: statusColors[status] }}>
          {statusLabels[status]}
        </Text>
      </Section>

      {isAccepted && (
        <Text style={text}>
          Le recruteur vous contactera prochainement pour les prochaines étapes.
          Préparez vos documents et restez disponible.
        </Text>
      )}

      {isRejected && (
        <Text style={text}>
          Nous vous remercions pour votre intérêt. Continuez à postuler à
          d&apos;autres offres qui correspondent à votre profil.
        </Text>
      )}

      {message && (
        <Section style={messageContainer}>
          <Text style={textSmall}>Message du recruteur :</Text>
          <Text style={text}>{message}</Text>
        </Section>
      )}

      <Hr style={divider} />

      <Text style={textSmall}>
        Pour toute question, contactez notre support à
        contact@agsglobalfarm.com.
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

const statusContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px 24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const statusText = {
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const messageContainer = {
  backgroundColor: "#f9fafb",
  borderLeft: "4px solid #059669",
  padding: "12px 16px",
  margin: "16px 0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};
