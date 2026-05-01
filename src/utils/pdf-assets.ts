import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

let cachedLogoDataUri: string | null = null;

/**
 * Load the AGS logo as a base64 data URI suitable for embedding into the
 * HTML rendered by expo-print. expo-print runs in an isolated WebView that
 * cannot resolve Metro http URIs or asset bundle paths, so we inline the
 * image as a data URI.
 *
 * Strategy:
 *  - Asset.fromModule + downloadAsync to materialize the bundled asset
 *  - For file:// URIs, FileSystem.readAsStringAsync(base64) returns base64 directly
 *  - For Metro http URIs (dev), download to cache first, then read as base64
 *
 * Falls back gracefully to null so PDF generation never fails on a missing logo.
 */
export async function getLogoDataUri(): Promise<string | null> {
  if (cachedLogoDataUri) return cachedLogoDataUri;

  try {
    const asset = Asset.fromModule(require("../../assets/images/Logo.png"));
    await asset.downloadAsync();

    let sourceUri = asset.localUri ?? asset.uri;
    if (!sourceUri) {
      console.warn("Logo asset has no usable URI");
      return null;
    }

    // Metro dev URIs are http(s):// — download to cache first
    if (sourceUri.startsWith("http://") || sourceUri.startsWith("https://")) {
      const target = `${FileSystem.cacheDirectory}ags-logo.png`;
      const dl = await FileSystem.downloadAsync(sourceUri, target);
      sourceUri = dl.uri;
    }

    const base64 = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) return null;

    cachedLogoDataUri = `data:image/png;base64,${base64}`;
    return cachedLogoDataUri;
  } catch (err) {
    console.warn("Failed to load logo for PDF", err);
    return null;
  }
}
