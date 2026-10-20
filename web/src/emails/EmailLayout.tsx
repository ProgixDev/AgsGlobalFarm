import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Hr,
  Text,
  Img,
  Link,
} from "@react-email/components";
import { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  previewText?: string;
}

export default function EmailLayout({
  children,
  previewText,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {previewText && (
        <Text
          style={{
            display: "none",
            overflow: "hidden",
            lineHeight: "1px",
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
          }}
        >
          {previewText}
        </Text>
      )}
      <Body style={main}>
        <Container style={container}>
          {/* Wavy SVG Decoration */}
          <Section style={wavyDecoration}>
            <svg
              width="100%"
              height="60"
              viewBox="0 0 600 60"
              preserveAspectRatio="none"
              style={{ display: "block" }}
            >
              <path
                d="M0 60 C 120 0 300 0 600 60 Z"
                fill="#059669"
                opacity="0.1"
              />
            </svg>
          </Section>

          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL || "https://agsglobalfarm.com"}/Logo.png`}
              alt="AGS Globalfarm SARL"
              width="100"
              height="100"
              style={logoImage}
            />
            <Text style={logoText}>🌾 AGS Globalfarm SARL</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              AGROPASTORAL GLOBALE FARMS SARL - Solutions Agricoles Innovantes
            </Text>
            <Text style={footerText}>📍 Sénégal</Text>
            <Text style={footerText}>
              📧 contact@agsglobalfarm.com | 📞 +221 78 138 38 38
            </Text>

            {/* Social Media Links */}
            <Section style={socialSection}>
              <Link
                href="https://www.facebook.com/share/1B2n3pZo2Q/?mibextid=wwXIfr"
                style={socialLink}
              >
                Facebook
              </Link>
              <Text style={socialSeparator}>•</Text>
              <Link
                href="https://www.instagram.com/agsglobalfarm?igsh=am12ZjdiejcxOGxy&utm_source=qr"
                style={socialLink}
              >
                Instagram
              </Link>
              <Text style={socialSeparator}>•</Text>
              <Link
                href="https://www.tiktok.com/@agsglobalfarm?_r=1&_t=ZS-93jOVOTImou"
                style={socialLink}
              >
                TikTok
              </Link>
              <Text style={socialSeparator}>•</Text>
              <Link href="https://x.com/agsglobalfarm?s=21" style={socialLink}>
                X
              </Link>
              <Text style={socialSeparator}>•</Text>
              <Link href="https://wa.me/221781383838" style={socialLink}>
                WhatsApp
              </Link>
            </Section>

            <Text style={footerTextSmall}>
              Vous recevez cet email car vous avez un compte sur notre
              plateforme. Si vous n&apos;êtes pas à l&apos;origine de cette
              demande, veuillez ignorer cet email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const wavyDecoration = {
  margin: "0",
  padding: "0",
};

const header = {
  backgroundColor: "#059669",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logoImage = {
  margin: "0 auto 16px",
  borderRadius: "8px",
};

const logoText = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
  letterSpacing: "-0.5px",
};

const content = {
  padding: "40px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "0 40px",
};

const footer = {
  padding: "32px 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const socialSection = {
  textAlign: "center" as const,
  margin: "16px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap" as const,
};

const socialLink = {
  color: "#059669",
  fontSize: "14px",
  textDecoration: "none",
  margin: "0 4px",
  fontWeight: "500",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const socialSeparator = {
  color: "#9ca3af",
  fontSize: "14px",
  margin: "0 4px",
  display: "inline",
};

const footerTextSmall = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "16px 0 0",
  fontFamily:
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};
