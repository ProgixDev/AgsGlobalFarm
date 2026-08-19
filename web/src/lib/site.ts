/**
 * Canonical public origin, without a trailing slash.
 * NEXT_PUBLIC_APP_URL is inlined at build time, so it must be set in the
 * build environment (Vercel project settings), not only at runtime.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://www.agsglobalfarm.com"
).replace(/\/+$/, "");
