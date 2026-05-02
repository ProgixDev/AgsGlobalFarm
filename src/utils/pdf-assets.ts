import * as FileSystem from "expo-file-system/legacy";
import { Image } from "react-native";

let cachedLogoDataUri: string | null = null;

// expo-asset's downloadAsync crashes with NoSuchMethodError on Android (native
// binary incompatibility). Use Image.resolveAssetSource() instead — it works
// in both dev (Metro http URI) and production (bundled asset URI) without
// touching expo-asset native modules.
export async function getLogoDataUri(): Promise<string | null> {
  if (cachedLogoDataUri) return cachedLogoDataUri;

  try {
    const source = Image.resolveAssetSource(require("../../assets/images/Logo.png"));
    let sourceUri = source?.uri;
    console.log("[pdf-assets] resolveAssetSource uri:", sourceUri);

    if (!sourceUri) {
      console.warn("[pdf-assets] Logo asset has no usable URI");
      return null;
    }

    // Both Metro http:// URIs (dev) and bundled asset:// URIs (prod) need
    // downloading to a cache file before FileSystem can read them as base64.
    const target = `${FileSystem.cacheDirectory}ags-logo.png`;
    const dl = await FileSystem.downloadAsync(sourceUri, target);
    sourceUri = dl.uri;

    const base64 = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) return null;

    cachedLogoDataUri = `data:image/png;base64,${base64}`;
    return cachedLogoDataUri;
  } catch (err) {
    console.warn("[pdf-assets] Failed to load logo for PDF", err);
    return null;
  }
}
