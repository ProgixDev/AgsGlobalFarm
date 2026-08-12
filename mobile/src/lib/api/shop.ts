import { apiFetch } from "@/lib/api/client";

export interface FetchProductsParams {
  category?: ShopCategory;
  q?: string;
  sort?: ShopSortOption;
  limit?: number;
  offset?: number;
}

export interface FetchProductsResult {
  products: ShopProduct[];
  total: number;
}

export interface ShopCategoryOption {
  key: ShopCategory;
  label: string;
}

function buildQuery(params: FetchProductsParams): string {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q && params.q.trim()) search.set("q", params.q.trim());
  if (params.sort && params.sort !== "none") search.set("sort", params.sort);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<FetchProductsResult> {
  return apiFetch<FetchProductsResult>(`/api/products${buildQuery(params)}`);
}

export async function fetchProductById(id: string): Promise<ShopProduct> {
  const data = await apiFetch<{ product: ShopProduct }>(
    `/api/products/${encodeURIComponent(id)}`,
  );
  return data.product;
}

export async function fetchCategories(): Promise<ShopCategoryOption[]> {
  const data = await apiFetch<{ categories: ShopCategoryOption[] }>(
    "/api/products/categories",
  );
  return data.categories;
}
