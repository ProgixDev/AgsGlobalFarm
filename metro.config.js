const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add woff2 to asset extensions
config.resolver.assetExts = [...config.resolver.assetExts, "woff2"];

module.exports = withNativeWind(config, { input: "./src/app/global.css" });
