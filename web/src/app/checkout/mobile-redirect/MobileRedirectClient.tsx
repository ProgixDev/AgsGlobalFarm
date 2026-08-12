"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

interface Props {
  token: string;
  cart: (Product & { quantity: number })[];
}

export default function MobileRedirectClient({ token, cart }: Props) {
  const router = useRouter();
  const { clearCart, addToCart } = useCart();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: applyError } =
          await authClient.oneTimeToken.verify({ token });
        if (applyError || !data) {
          if (cancelled) return;
          setError(
            applyError?.message ||
              "Lien expiré ou invalide. Reconnectez-vous depuis l'application.",
          );
          return;
        }

        if (cancelled) return;

        clearCart();
        for (const item of cart) {
          for (let i = 0; i < item.quantity; i += 1) {
            addToCart(item);
          }
        }

        router.replace("/checkout");
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        setError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, cart, addToCart, clearCart, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-3">
              Connexion impossible
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Se connecter
            </a>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Préparation du paiement
            </h1>
            <p className="text-gray-600">
              Nous vous redirigeons vers votre commande...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
