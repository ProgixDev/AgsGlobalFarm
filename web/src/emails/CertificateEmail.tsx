import { Heading, Text, Button, Section, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface CertificateEmailProps {
  userName: string;
  formationTitle: string;
  quizScore: number;
  totalQuestions: number;
}

export default function CertificateEmail({
  userName,
  formationTitle,
  quizScore,
  totalQuestions,
}: CertificateEmailProps) {
  return (
    <EmailLayout previewText="Votre certificat de formation AGS Globalfarm">
      <Heading style={heading}>🎓 Félicitations !</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Nous avons le plaisir de vous informer que vous avez réussi le quiz de
        la formation <strong>{formationTitle}</strong> avec un score de{" "}
        <strong>
          {quizScore}/{totalQuestions}
        </strong>
        .
      </Text>

      <Section style={certificateBox}>
        <Text style={certificateTitle}>📜 Votre Certificat</Text>
        <Text style={certificateText}>
          Votre certificat de formation est joint à cet email en pièce jointe
          (PDF). Vous pouvez le télécharger et l&apos;imprimer à tout moment.
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={paragraph}>
        Ce certificat atteste de votre participation et de votre réussite à la
        formation. Conservez-le précieusement, il pourra vous être utile dans
        votre parcours professionnel.
      </Text>

      <Text style={paragraph}>
        Si vous avez des questions ou si vous souhaitez suivre d&apos;autres
        formations, n&apos;hésitez pas à visiter notre plateforme.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_APP_URL || "https://agsglobalfarm.com"}/mes-formations`}
        >
          Voir mes formations
        </Button>
      </Section>

      <Text style={signature}>
        Cordialement,
        <br />
        L&apos;équipe AGS Globalfarm SARL
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "28px",
  fontWeight: "bold" as const,
  color: "#059669",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "16px 0",
};

const certificateBox = {
  backgroundColor: "#ecfdf5",
  padding: "24px",
  borderRadius: "8px",
  border: "1px solid #a7f3d0",
  margin: "24px 0",
  textAlign: "center" as const,
};

const certificateTitle = {
  fontSize: "20px",
  fontWeight: "600" as const,
  color: "#059669",
  marginBottom: "12px",
};

const certificateText = {
  fontSize: "15px",
  color: "#374151",
  lineHeight: "22px",
  margin: "8px 0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#059669",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "600" as const,
  fontSize: "16px",
  display: "inline-block",
};

const signature = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  marginTop: "32px",
  fontStyle: "italic" as const,
};
