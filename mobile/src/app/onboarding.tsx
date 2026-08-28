import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import { router } from "expo-router";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";

const { width, height } = Dimensions.get("window");

interface Slide {
  title: string;
  description: string;
  image: any;
  accentColor: string;
}

const slides: Slide[] = [
  {
    title: "Bienvenue sur GrowFarm",
    description:
      "Connectez les acteurs du secteur agricole sénégalais à travers une plateforme interactive.",
    image: require("@/assets/images/Logo.png"),
    accentColor: colors.success,
  },
  {
    title: "Carte Interactive",
    description:
      "Explorez les fermes à travers le Sénégal, consultez les profils et filtrez par type de production.",
    image: require("@/assets/images/Drone.png"),
    accentColor: colors.info,
  },
  {
    title: "Conseils Personnalisés",
    description:
      "Obtenez des recommandations adaptées pour la fertilisation et les traitements phytosanitaires.",
    image: require("@/assets/images/BlackManExplaining.png"),
    accentColor: colors.warning,
  },
  {
    title: "Emploi Agricole",
    description:
      "Trouvez des emplois ou recrutez des talents dans le secteur agricole.",
    image: require("@/assets/images/TwoBlackPplTalking.png"),
    accentColor: colors.purple,
  },
  {
    title: "Formation Agricole",
    description:
      "Apprenez les meilleures pratiques pour les cultures, les maladies et les techniques durables.",
    image: require("@/assets/images/formation.jpg"),
    accentColor: colors.danger,
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentIndex) {
      haptic.selection();
      setCurrentIndex(slideIndex);
    }
  };

  const goToNext = () => {
    haptic.light();
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({ x: prevIndex * width, animated: true });
    }
  };

  const skip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboardingCompleted", "true");
      router.replace("/");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="absolute inset-0">
        <View
          className="absolute -top-24 -left-14 w-64 h-64 rounded-full"
          style={{ backgroundColor: `${slides[currentIndex].accentColor}18` }}
        />
        <View
          className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full"
          style={{ backgroundColor: `${slides[currentIndex].accentColor}10` }}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View
            key={index}
            className="flex-1 px-5"
            style={{ width, paddingTop: insets.top + 12 }}
          >
            <View className="flex-1 w-full items-center justify-center pb-8">
              <View
                className="w-full rounded-[34px] border border-black/5 bg-white px-5 pt-5 pb-7 shadow-lg shadow-black/5"
                style={{ maxWidth: 420 }}
              >
                <View
                  className="w-full overflow-hidden items-center justify-center rounded-[28px]"
                  style={{
                    backgroundColor: `${slide.accentColor}12`,
                    height: Math.min(height * 0.34, 290),
                  }}
                >
                  <Image
                    source={slide.image}
                    className="w-full h-full"
                    resizeMode={index === 0 ? "contain" : "cover"}
                  />
                </View>

                <View className="items-center px-2 pt-6">
                  <Text className="text-[30px] font-heading-bold text-foreground text-center leading-9">
                    {slide.title}
                  </Text>

                  <View
                    className="w-16 h-1.5 rounded-full my-4"
                    style={{ backgroundColor: slide.accentColor }}
                  />

                  <Text className="text-base font-sans text-muted-foreground text-center leading-7">
                    {slide.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View
        className="px-5"
        style={{ paddingBottom: Math.max(insets.bottom + 4, 24) }}
      >
        <View className="flex-row justify-center mb-7">
          {slides.map((slide, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                scrollViewRef.current?.scrollTo({
                  x: index * width,
                  animated: true,
                });
                setCurrentIndex(index);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
              className="py-2"
            >
              <View
                style={{
                  backgroundColor:
                    index === currentIndex
                      ? slide.accentColor
                      : `${colors.black}20`,
                }}
                className={`h-2.5 rounded-full mx-1.5 ${
                  index === currentIndex ? "w-9" : "w-2.5"
                }`}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View className="gap-3">
          <AnimatedPressable
            onPress={goToNext}
            hapticType="light"
            className="rounded-2xl items-center justify-center py-4 px-6 min-h-[52px]"
            style={{ backgroundColor: slides[currentIndex].accentColor }}
          >
            <Text className="text-white text-base font-sans-semibold text-center">
              {currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}
            </Text>
          </AnimatedPressable>

          <View className="flex-row justify-between items-center px-1 min-h-[32px]">
            {currentIndex > 0 ? (
              <TouchableOpacity
                onPress={goToPrev}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              >
                <Text
                  className="font-sans-semibold text-base"
                  style={{ color: slides[currentIndex].accentColor }}
                >
                  ← Précédent
                </Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {currentIndex < slides.length - 1 && (
              <TouchableOpacity
                onPress={skip}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              >
                <Text className="text-muted-foreground font-sans-medium text-base">
                  Passer
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
