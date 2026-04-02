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
    title: "Bienvenue sur AGS Mobile",
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
      {/* Decorative background gradient */}
      <View className="absolute inset-0 opacity-5">
        <View
          className="flex-1"
          style={{ backgroundColor: slides[currentIndex].accentColor }}
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
            className="flex-1 justify-center items-center px-6"
            style={{ width, paddingTop: insets.top + 16 }}
          >
            <View className="items-center w-full">
              {/* Bento-grid style image container */}
              <View className="mb-12 relative" style={{ height: height * 0.4 }}>
                {index === 0 ? (
                  // First slide - centered logo
                  <View className="items-center justify-center h-full">
                    <View
                      className="overflow-hidden p-12 rounded-full"
                      style={{
                        backgroundColor: `${slide.accentColor}15`,
                      }}
                    >
                      <Image
                        source={slide.image}
                        className="w-48 h-48"
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                ) : (
                  // Other slides - bento grid layout
                  <View className="relative w-full h-full items-center justify-center">
                    {/* Main large image */}
                    <View
                      className="overflow-hidden absolute w-60 h-72 z-10 shadow-lg shadow-black/10 rounded-[32px]"
                      style={{
                        backgroundColor: `${slide.accentColor}10`,
                      }}
                    >
                      <Image
                        source={slide.image}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>

                    {/* Decorative smaller images */}
                    <View
                      className="overflow-hidden absolute top-0 left-4 w-24 h-32 shadow-md shadow-black/10 rounded-3xl"
                      style={{
                        backgroundColor: `${slide.accentColor}08`,
                      }}
                    >
                      <Image
                        source={slide.image}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>

                    <View
                      className="overflow-hidden absolute bottom-4 right-6 w-28 h-28 shadow-md shadow-black/10 rounded-3xl"
                      style={{
                        backgroundColor: `${slide.accentColor}08`,
                      }}
                    >
                      <Image
                        source={slide.image}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>

                    <View
                      className="overflow-hidden absolute top-12 right-2 w-20 h-24 shadow-md shadow-black/10 rounded-[20px]"
                      style={{
                        backgroundColor: `${slide.accentColor}08`,
                      }}
                    >
                      <Image
                        source={slide.image}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Text content */}
              <View className="items-center px-4">
                <Text className="text-3xl font-heading-bold text-foreground text-center mb-4 leading-10">
                  {slide.title}
                </Text>
                <View
                  className="w-16 h-1 rounded-full mb-6"
                  style={{ backgroundColor: slide.accentColor }}
                />
                <Text className="text-lg font-sans text-muted-foreground text-center leading-7 px-4">
                  {slide.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View
        className="px-6"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        {/* Indicators */}
        <View className="flex-row justify-center mb-8">
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
              hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
              className="py-3"
            >
              <View
                style={{
                  backgroundColor:
                    index === currentIndex
                      ? slide.accentColor
                      : `${colors.black}20`,
                }}
                className={`h-2.5 rounded-full mx-1.5 ${
                  index === currentIndex ? "w-10" : "w-2.5"
                }`}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation */}
        <View className="gap-4">
          <AnimatedPressable
            onPress={goToNext}
            hapticType="light"
            className="rounded-xl items-center justify-center py-4 px-6"
            style={{ backgroundColor: slides[currentIndex].accentColor }}
          >
            <Text className="text-white text-base font-sans-semibold text-center">
              {currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}
            </Text>
          </AnimatedPressable>

          <View className="flex-row justify-between items-center px-2">
            {currentIndex > 0 ? (
              <TouchableOpacity onPress={goToPrev} activeOpacity={0.7}>
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
              <TouchableOpacity onPress={skip} activeOpacity={0.7}>
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
