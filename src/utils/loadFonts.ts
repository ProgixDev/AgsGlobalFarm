import * as Font from "expo-font";

// Geist font loading - using local assets
export const loadFonts = async (): Promise<void> => {
  return Font.loadAsync({
    Geist: require("../../assets/fonts/geist-latin-400-normal.woff2"),
    "Geist-Medium": require("../../assets/fonts/geist-latin-500-normal.woff2"),
    "Geist-SemiBold": require("../../assets/fonts/geist-latin-600-normal.woff2"),
    "Geist-Bold": require("../../assets/fonts/geist-latin-700-normal.woff2"),
  });
};
