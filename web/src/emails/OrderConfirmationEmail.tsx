import { Heading, Text, Button, Section, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import type {
  Order,
  OrderItem,
  Formation,
  Product,
  PresentialFormation,
} from "@/types";

interface OrderConfirmationEmailProps {
  customerName: string;
  order: Order;
  receiptUrl?: string;
}

export default function OrderConfirmationEmail({
  customerName,
  order,
  receiptUrl,
}: OrderConfirmationEmailProps) {
  const hasPresentialFormation = order.items.some(
    (item) => "title" in item && "sessions" in item,
  );

  return (
    <EmailLayout previewText="Confirmation de votre commande AGS Globalfarm">
      <Heading style={heading}>Merci pour votre commande !</Heading>

      <Text style={paragraph}>Bonjour {customerName},</Text>

      <Text style={paragraph}>
        Nous avons bien reçu votre commande et votre paiement a été confirmé.
        Merci de votre confiance !
      </Text>

      {/* Order Details */}
      <Section style={orderSection}>
        <Text style={sectionTitle}>📋 Détails de la commande</Text>

        {order.items.map((item, index) => {
          const isFormation = "title" in item;
          const itemName = isFormation
            ? (item as Formation).title
            : (item as Product).name;
          const itemPrice = "priceTTC" in item ? (item as Product).priceTTC : (item as Formation).price;
          const quantity = item.quantity;

          return (
            <Section key={index} style={itemContainer}>
              <Text style={itemNameStyle}>
                {itemName} {isFormation && "📚"}
              </Text>
              <Text style={itemDetails}>
                Quantité: {quantity} × {itemPrice.toLocaleString("fr-FR")} FCFA
              </Text>
              <Text style={itemTotal}>
                Total: {(quantity * itemPrice).toLocaleString("fr-FR")} FCFA
              </Text>
            </Section>
          );
        })}

        <Hr style={divider} />

        <Section style={totalSection}>
          <Text style={totalLabel}>Total payé:</Text>
          <Text style={totalAmount}>
            {order.totalAmount.toLocaleString("fr-FR")} FCFA
          </Text>
        </Section>
      </Section>

      {/* Presential Formation Info */}
      {hasPresentialFormation && (
        <Section style={infoBox}>
          <Text style={infoTitle}>🎓 Formation</Text>
          {order.items
            .filter((item) => "title" in item)
            .map((item, index) => {
              const formation = item as PresentialFormation & OrderItem;
              const session = formation.sessions?.find(
                (s) => s.id === formation.sessionId,
              );

              return (
                <Section key={index} style={formationDetails}>
                  <Text style={formationName}>{formation.title}</Text>
                  {session && (
                    <>
                      <Text style={formationInfo}>
                        📅 Date:{" "}
                        {new Date(session.startDate).toLocaleDateString(
                          "fr-FR",
                        )}{" "}
                        -{" "}
                        {new Date(session.endDate).toLocaleDateString("fr-FR")}
                      </Text>
                      <Text style={formationInfo}>
                        📍 Lieu: {session.location}
                      </Text>
                      {formation.address && (
                        <Text style={formationInfo}>
                          🏢 Adresse: {formation.address}
                        </Text>
                      )}
                      {formation.contactPhone && (
                        <Text style={formationInfo}>
                          📞 Contact: {formation.contactPhone}
                        </Text>
                      )}
                    </>
                  )}
                </Section>
              );
            })}
          <Text style={paragraph}>
            Vous recevrez un email de confirmation supplémentaire avec tous les
            détails pratiques avant le début de la formation.
          </Text>
        </Section>
      )}

      {/* Shipping Info */}
      {order.address && (
        <Section style={infoBox}>
          <Text style={infoTitle}>📦 Adresse de livraison</Text>
          <Text style={addressText}>{order.address.street}</Text>
          <Text style={addressText}>
            {order.address.postalCode} {order.address.city}
          </Text>
          <Text style={addressText}>{order.address.country}</Text>
          <Text style={paragraph}>
            Votre commande sera livrée à l&apos;adresse ci-dessus dans les
            meilleurs délais. Vous serez informé de l&apos;avancement de votre
            livraison.
          </Text>
        </Section>
      )}

      {/* Receipt Button */}
      {receiptUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={receiptUrl}>
            Voir le reçu de paiement
          </Button>
        </Section>
      )}

      <Hr style={divider} />

      <Text style={paragraph}>
        Si vous avez des questions concernant votre commande, n&apos;hésitez pas
        à nous contacter.
      </Text>

      <Text style={signature}>
        Cordialement,
        <br />
        L&apos;équipe AGS Globalfarm SARL
      </Text>
    </EmailLayout>
  );
}

// Styles
const heading = {
  fontSize: "28px",
  fontWeight: "bold",
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

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "16px",
};

const orderSection = {
  backgroundColor: "#f9fafb",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
};

const itemContainer = {
  marginBottom: "16px",
};

const itemNameStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  margin: "4px 0",
};

const itemDetails = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "4px 0",
};

const itemTotal = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#059669",
  margin: "4px 0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const totalSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "16px",
};

const totalLabel = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
};

const totalAmount = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#059669",
};

const infoBox = {
  backgroundColor: "#ecfdf5",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #a7f3d0",
  margin: "24px 0",
};

const infoTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#059669",
  marginBottom: "12px",
};

const formationDetails = {
  marginBottom: "16px",
};

const formationName = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  margin: "8px 0",
};

const formationInfo = {
  fontSize: "14px",
  color: "#374151",
  margin: "4px 0",
};

const addressText = {
  fontSize: "14px",
  color: "#374151",
  margin: "4px 0",
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
  fontWeight: "600",
  fontSize: "16px",
  display: "inline-block",
};

const signature = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  marginTop: "32px",
  fontStyle: "italic",
};
