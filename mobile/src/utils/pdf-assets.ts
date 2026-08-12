import { LOGO_PNG_BASE64 } from "@/utils/logo-base64";

// Logo embedded as base64 at build time. Avoids runtime asset-resolution
// failures in production where Image.resolveAssetSource + FileSystem.downloadAsync
// can't reliably read bundled asset:// URIs.
const LOGO_DATA_URI = `data:image/png;base64,${LOGO_PNG_BASE64}`;

export async function getLogoDataUri(): Promise<string | null> {
  return LOGO_DATA_URI;
}
