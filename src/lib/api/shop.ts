const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL not set");
}

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
  const url = `${API_URL}/api/products${buildQuery(params)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }
  const data = (await res.json()) as FetchProductsResult;
  return data;
}

export async function fetchProductById(id: string): Promise<ShopProduct> {
  const url = `${API_URL}/api/products/${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (res.status === 404) {
    throw new Error("Produit introuvable");
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch product (${res.status})`);
  }
  const data = (await res.json()) as { product: ShopProduct };
  return data.product;
}

export async function fetchCategories(): Promise<ShopCategoryOption[]> {
  const url = `${API_URL}/api/products/categories`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }
  const data = (await res.json()) as { categories: ShopCategoryOption[] };
  return data.categories;
}
