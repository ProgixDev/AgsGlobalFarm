import * as Font from "expo-font";

export const loadFonts = async (): Promise<void> => {
  return Font.loadAsync({
    "Figtree-Regular": require("../../assets/fonts/Figtree-Regular.ttf"),
    "Figtree-Medium": require("../../assets/fonts/Figtree-Medium.ttf"),
    "Figtree-SemiBold": require("../../assets/fonts/Figtree-SemiBold.ttf"),
    "Figtree-Bold": require("../../assets/fonts/Figtree-Bold.ttf"),
    "DMSans-Medium": require("../../assets/fonts/DMSans-Medium.ttf"),
    "DMSans-SemiBold": require("../../assets/fonts/DMSans-SemiBold.ttf"),
    "DMSans-Bold": require("../../assets/fonts/DMSans-Bold.ttf"),
    "DMSans-ExtraBold": require("../../assets/fonts/DMSans-ExtraBold.ttf"),
  });
};
