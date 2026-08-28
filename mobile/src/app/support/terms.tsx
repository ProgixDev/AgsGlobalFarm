import React, { useState } from "react";
import { View, Text, ScrollView, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { PRIVACY_POLICY_URL, SUPPORT_EMAIL } from "@/config/contact";

interface Section {
  id: string;
  title: string;
  content: string;
}

const TERMS_SECTIONS: Section[] = [
  {
    id: "1",
    title: "Acceptation des conditions",
    content:
      "En accédant à l'application GrowFarm et en l'utilisant, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application. Nous nous réservons le droit de modifier ces conditions à tout moment, avec notification préalable aux utilisateurs.",
  },
  {
    id: "2",
    title: "Description du service",
    content:
      "GrowFarm est une plateforme numérique dédiée au secteur agricole au Sénégal. Elle met en relation les chercheurs d'emploi agricole et les propriétaires d'exploitations, tout en fournissant des conseils agricoles personnalisés, des formations et une cartographie des ressources rurales.",
  },
  {
    id: "3",
    title: "Création et gestion de compte",
    content:
      "Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion. Vous acceptez de fournir des informations exactes et complètes lors de votre inscription. Tout accès non autorisé à votre compte doit être signalé immédiatement. Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de violation des présentes conditions.",
  },
  {
    id: "4",
    title: "Utilisation acceptable",
    content:
      "Vous vous engagez à utiliser l'application uniquement à des fins légales et conformément aux présentes conditions. Il est interdit de publier des contenus faux, trompeurs ou frauduleux, de harceler d'autres utilisateurs, d'utiliser l'application à des fins commerciales non autorisées, ou de tenter de compromettre la sécurité de la plateforme.",
  },
  {
    id: "5",
    title: "Offres d'emploi et candidatures",
    content:
      "Les offres d'emploi publiées sur la plateforme doivent être réelles et conformes à la législation sénégalaise du travail. GrowFarm agit uniquement en tant qu'intermédiaire et ne peut être tenu responsable des accords conclus entre employeurs et candidats. Toute offre frauduleuse doit être signalée immédiatement à notre équipe.",
  },
  {
    id: "6",
    title: "Contenus et propriété intellectuelle",
    content:
      "Les contenus fournis par GrowFarm (formations, conseils, cartographie) sont protégés par les droits de propriété intellectuelle. Vous pouvez les utiliser à des fins personnelles et non commerciales. Toute reproduction, distribution ou modification sans autorisation écrite préalable est strictement interdite.",
  },
  {
    id: "7",
    title: "Protection des données personnelles",
    content:
      "Nous collectons et traitons vos données personnelles conformément à la législation sénégalaise sur la protection des données personnelles (Loi n° 2008-12). Vos données sont utilisées uniquement pour fournir et améliorer nos services. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Le détail des données collectées, des destinataires et des durées de conservation figure dans notre politique de confidentialité, accessible depuis le bouton en bas de cet écran.",
  },
  {
    id: "8",
    title: "Limitation de responsabilité",
    content:
      "GrowFarm est fourni « tel quel » sans garantie d'aucune sorte. Nous ne pouvons être tenus responsables des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser l'application, des erreurs ou inexactitudes dans les contenus, ou des actions des utilisateurs de la plateforme.",
  },
  {
    id: "9",
    title: "Suspension et résiliation",
    content:
      "Vous pouvez demander la suppression de votre compte à tout moment en écrivant à notre support depuis l'adresse e-mail associée à votre compte ; elle est effectuée dans un délai de 30 jours. Nous nous réservons le droit de suspendre ou résilier votre accès en cas de violation des présentes conditions, sans préavis ni remboursement. Les dispositions relatives à la propriété intellectuelle et à la limitation de responsabilité survivent à la résiliation.",
  },
  {
    id: "10",
    title: "Droit applicable",
    content:
      "Les présentes conditions sont régies par le droit sénégalais. Tout litige découlant de l'utilisation de l'application sera soumis à la juridiction exclusive des tribunaux compétents de Dakar, Sénégal.",
  },
];

export default function TermsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    haptic.selection();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openPrivacyPolicy = async () => {
    haptic.selection();
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert(
        "Impossible d'ouvrir le lien",
        `Consultez ${PRIVACY_POLICY_URL} depuis votre navigateur.`,
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ScreenHeader
        title="Conditions d'utilisation"
        subtitle="Dernière mise à jour : janvier 2025"
        showBack
      />

      <FadeInView className="px-6 py-6 gap-4">
        {/* Intro card */}
        <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex-row">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
            style={{ marginTop: 1 }}
          />
          <Text className="text-sm font-sans text-muted-foreground ml-2 flex-1 leading-relaxed">
            Veuillez lire attentivement les présentes conditions avant
            d&apos;utiliser GrowFarm. En utilisant l&apos;application, vous
            acceptez l&apos;intégralité de ces conditions.
          </Text>
        </View>

        {/* Sections accordion */}
        <View className="gap-3">
          {TERMS_SECTIONS.map((section) => {
            const isOpen = expandedId === section.id;
            return (
              <AnimatedPressable
                key={section.id}
                onPress={() => toggle(section.id)}
                hapticType="none"
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${
                  isOpen ? "border-primary/30" : "border-transparent"
                }`}
              >
                <View className="flex-row items-center px-4 py-4">
                  <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-3">
                    <Text className="text-xs font-sans-bold text-primary">
                      {section.id}
                    </Text>
                  </View>
                  <Text className="flex-1 text-sm font-sans-semibold text-foreground pr-2">
                    {section.title}
                  </Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.mutedLight}
                  />
                </View>
                {isOpen && (
                  <View className="px-4 pb-4">
                    <View className="h-px bg-gray-100 mb-3" />
                    <Text className="text-sm font-sans text-muted-foreground leading-relaxed">
                      {section.content}
                    </Text>
                  </View>
                )}
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Privacy policy */}
        <AnimatedPressable
          onPress={openPrivacyPolicy}
          className="bg-white rounded-2xl shadow-sm p-5 flex-row items-center gap-3"
        >
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-sans-semibold text-foreground">
              Politique de confidentialité
            </Text>
            <Text className="text-xs font-sans text-muted-foreground mt-0.5">
              Quelles données nous collectons et vos droits
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.mutedLight} />
        </AnimatedPressable>

        {/* Footer */}
        <View className="bg-white rounded-2xl shadow-sm p-5 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-sans-semibold text-foreground">
              Des questions ?
            </Text>
            <Text className="text-xs font-sans text-muted-foreground mt-0.5">
              {SUPPORT_EMAIL}
            </Text>
          </View>
        </View>
      </FadeInView>
    </ScrollView>
  );
}
