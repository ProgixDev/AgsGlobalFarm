import { authClient } from "@/lib/auth-client";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function generateOneTimeToken(): Promise<string> {
  const result = await authClient.oneTimeToken.generate();
  if (result.error || !result.data?.token) {
    throw new Error(
      result.error?.message || "Impossible de générer le jeton de paiement",
    );
  }
  return result.data.token;
}

export interface CheckoutCartLine {
  productId: string;
  quantity: number;
}

export function buildMobileCheckoutUrl(
  token: string,
  cart: CheckoutCartLine[],
): string {
  const items = cart
    .map((line) => `${encodeURIComponent(line.productId)}:${line.quantity}`)
    .join(",");
  const params = new URLSearchParams();
  params.set("token", token);
  if (items) params.set("items", items);
  return `${API_URL}/checkout/mobile-redirect?${params.toString()}`;
}
