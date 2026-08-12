import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  type ProductSort,
  type ShopCategoryFilter,
} from "@/lib/db";

const VALID_CATEGORIES: ShopCategoryFilter[] = [
  "engrais",
  "phyto",
  "semence",
  "petit_materiel",
];
const VALID_SORTS: ProductSort[] = ["none", "price_asc", "price_desc"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const categoryRaw = searchParams.get("category");
  const sortRaw = searchParams.get("sort");
  const q = searchParams.get("q") ?? undefined;
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");

  const category =
    categoryRaw && VALID_CATEGORIES.includes(categoryRaw as ShopCategoryFilter)
      ? (categoryRaw as ShopCategoryFilter)
      : undefined;

  const sort =
    sortRaw && VALID_SORTS.includes(sortRaw as ProductSort)
      ? (sortRaw as ProductSort)
      : "none";

  const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10) || 0, 1), 200) : 100;
  const offset = offsetRaw ? Math.max(parseInt(offsetRaw, 10) || 0, 0) : 0;

  const { products, total } = await getProducts({
    category,
    q,
    sort,
    limit,
    offset,
  });

  return NextResponse.json({ products, total });
}
