export const SUPPORT_EMAIL = "support@agsglobalfarm.com";
export const SUPPORT_SUBJECT = "Support AGS Globalfarm";

/** Public privacy policy. Required by the App Store and Google Play listings. */
export const PRIVACY_POLICY_URL = `${(
  process.env.EXPO_PUBLIC_API_URL ?? "https://www.agsglobalfarm.com"
).replace(/\/+$/, "")}/politique-de-confidentialite`;
