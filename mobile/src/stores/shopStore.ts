import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  type ShopCategoryOption,
} from "@/lib/api/shop";

const TAX_RATE = 0.18;
const SHIPPING_FLAT_FEE = 2000;

type ProductsStatus = "idle" | "loading" | "ready" | "error";

interface ShopStore {
  products: ShopProduct[];
  productsStatus: ProductsStatus;
  productsError: string | null;
  categories: ShopCategoryOption[];
  cart: ShopCartItem[];
  selectedCategory: "all" | ShopCategory;
  sortOption: ShopSortOption;
  searchQuery: string;
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  refreshProductById: (productId: string) => Promise<ShopProduct | null>;
  setCategory: (category: "all" | ShopCategory) => void;
  setSortOption: (option: ShopSortOption) => void;
  setSearchQuery: (query: string) => void;
  getProductById: (productId: string) => ShopProduct | undefined;
  getVisibleProducts: () => ShopProduct[];
  getCartCount: () => number;
  getCartQuantityForProduct: (productId: string) => number;
  addToCart: (productId: string) => { ok: boolean; message?: string };
  incrementItem: (productId: string) => { ok: boolean; message?: string };
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getCartTotals: () => ShopCartTotals;
}

function sortProducts(products: ShopProduct[], sortOption: ShopSortOption) {
  if (sortOption === "none") return products;

  const sorted = [...products];
  sorted.sort((a, b) => {
    if (sortOption === "price_asc") return a.priceTTC - b.priceTTC;
    return b.priceTTC - a.priceTTC;
  });
  return sorted;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      products: [],
      productsStatus: "idle",
      productsError: null,
      categories: [],
      cart: [],
      selectedCategory: "all",
      sortOption: "none",
      searchQuery: "",

      loadProducts: async () => {
        set({ productsStatus: "loading", productsError: null });
        try {
          const { products } = await fetchProducts({ limit: 200 });
          set({ products, productsStatus: "ready" });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Erreur de chargement";
          set({ productsStatus: "error", productsError: message });
        }
      },

      loadCategories: async () => {
        try {
          const categories = await fetchCategories();
          set({ categories });
        } catch (err) {
          console.warn("Failed to load categories", err);
        }
      },

      refreshProductById: async (productId: string) => {
        try {
          const product = await fetchProductById(productId);
          set((state) => {
            const idx = state.products.findIndex((p) => p.id === productId);
            if (idx === -1) {
              return { products: [...state.products, product] };
            }
            const next = [...state.products];
            next[idx] = product;
            return { products: next };
          });
          return product;
        } catch (err) {
          console.warn("Failed to refresh product", err);
          return null;
        }
      },

      setCategory: (category) => set({ selectedCategory: category }),
      setSortOption: (option) => set({ sortOption: option }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      getProductById: (productId: string) => {
        return get().products.find((product) => product.id === productId);
      },

      getVisibleProducts: () => {
        const { products, selectedCategory, sortOption, searchQuery } = get();
        let filtered =
          selectedCategory === "all"
            ? products
            : products.filter(
                (product) => product.category === selectedCategory,
              );

        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.shortDescription.toLowerCase().includes(q) ||
              (p.brand && p.brand.toLowerCase().includes(q)),
          );
        }

        return sortProducts(filtered, sortOption);
      },

      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      getCartQuantityForProduct: (productId: string) => {
        return (
          get().cart.find((item) => item.productId === productId)?.quantity ?? 0
        );
      },

      addToCart: (productId: string) => {
        const state = get();
        const product = state.getProductById(productId);
        if (!product) return { ok: false, message: "Produit introuvable." };
        if (!product.isInStock || product.stockQty <= 0) {
          return { ok: false, message: "Produit en rupture de stock." };
        }

        const existingQty = state.getCartQuantityForProduct(productId);
        if (existingQty >= product.stockQty) {
          return { ok: false, message: "Stock maximum atteint." };
        }

        if (existingQty === 0) {
          set({ cart: [...state.cart, { productId, quantity: 1 }] });
          return { ok: true };
        }

        set({
          cart: state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        });
        return { ok: true };
      },

      incrementItem: (productId: string) => {
        return get().addToCart(productId);
      },

      decrementItem: (productId: string) => {
        const state = get();
        const existing = state.cart.find(
          (item) => item.productId === productId,
        );
        if (!existing) return;

        if (existing.quantity <= 1) {
          set({
            cart: state.cart.filter((item) => item.productId !== productId),
          });
          return;
        }

        set({
          cart: state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getCartTotals: () => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => {
          const product = state.getProductById(item.productId);
          return sum + (product ? product.priceTTC * item.quantity : 0);
        }, 0);
        const tax = Math.round(subtotal * TAX_RATE);
        const shipping = state.cart.length > 0 ? SHIPPING_FLAT_FEE : 0;
        const total = subtotal + tax + shipping;
        return { subtotal, tax, shipping, total };
      },
    }),
    {
      name: "@ags_shop_storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        selectedCategory: state.selectedCategory,
        sortOption: state.sortOption,
      }),
    },
  ),
);
