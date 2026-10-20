import { Heading, Text, Section, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface ContactEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export default function ContactEmail({
  name,
  email,
  phone,
  subject,
  message,
}: ContactEmailProps) {
  const getSubjectLabel = (subject: string) => {
    switch (subject) {
      case "training":
        return "Formation";
      case "event":
        return "Événement";
      case "partnership":
        return "Partenariat";
      case "consultation":
        return "Consultation";
      case "other":
        return "Autre";
      default:
        return subject;
    }
  };

  return (
    <EmailLayout
      previewText={`Message de ${name} - ${getSubjectLabel(subject)}`}
    >
      <Section style={section}>
        <Heading style={heading}>Nouveau message de contact</Heading>
        <Text style={text}>
          Vous avez reçu un nouveau message via le formulaire de contact du site
          web.
        </Text>

        <Hr style={hr} />

        <Section style={infoSection}>
          <Text style={label}>Nom complet :</Text>
          <Text style={value}>{name}</Text>

          <Text style={label}>Email :</Text>
          <Text style={value}>
            <a href={`mailto:${email}`} style={link}>
              {email}
            </a>
          </Text>

          {phone && (
            <>
              <Text style={label}>Téléphone :</Text>
              <Text style={value}>
                <a href={`tel:${phone}`} style={link}>
                  {phone}
                </a>
              </Text>
            </>
          )}

          <Text style={label}>Sujet :</Text>
          <Text style={value}>{getSubjectLabel(subject)}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={messageSection}>
          <Text style={label}>Message :</Text>
          <Text style={messageText}>{message}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Ce message a été envoyé depuis le formulaire de contact du site web
          AGS Globalfarm SARL.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const section = {
  padding: "24px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#059669",
  marginBottom: "16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  marginBottom: "16px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const infoSection = {
  marginBottom: "16px",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
  marginBottom: "4px",
  marginTop: "12px",
};

const value = {
  fontSize: "16px",
  color: "#111827",
  marginTop: "0",
  marginBottom: "0",
};

const link = {
  color: "#059669",
  textDecoration: "none",
};

const messageSection = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  borderLeft: "4px solid #059669",
};

const messageText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  whiteSpace: "pre-wrap" as const,
  marginTop: "8px",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  fontStyle: "italic",
  marginTop: "16px",
};
