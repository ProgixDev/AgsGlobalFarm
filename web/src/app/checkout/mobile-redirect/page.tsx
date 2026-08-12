import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProducts } from "@/lib/db";
import MobileRedirectClient from "./MobileRedirectClient";

interface SearchParams {
  token?: string;
  items?: string;
}

export default async function MobileRedirectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const token = params.token;
  const itemsRaw = params.items;

  if (!token) {
    redirect("/login?error=missing_token");
  }

  let parsed: { productId: string; quantity: number }[] = [];
  if (itemsRaw) {
    parsed = itemsRaw
      .split(",")
      .map((pair) => {
        const [productId, qtyStr] = pair.split(":");
        const qty = parseInt(qtyStr || "0", 10);
        if (!productId || qty <= 0) return null;
        return { productId, quantity: qty };
      })
      .filter((x): x is { productId: string; quantity: number } => x !== null);
  }

  const { products } = await getProducts({ limit: 200 });
  const cart = parsed
    .map(({ productId, quantity }) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      const cap = Math.min(quantity, product.stockQty || quantity);
      if (cap <= 0) return null;
      return {
        ...product,
        quantity: cap,
      };
    })
    .filter((x) => x !== null);

  return <MobileRedirectClient token={token} cart={cart} />;
}
