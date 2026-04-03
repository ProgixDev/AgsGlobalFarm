import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { shopProducts } from "@/data/shop-products";

const TAX_RATE = 0.18;
const SHIPPING_FLAT_FEE = 2000;

interface ShopStore {
  products: ShopProduct[];
  cart: ShopCartItem[];
  selectedCategory: "all" | ShopCategory;
  sortOption: ShopSortOption;
  setCategory: (category: "all" | ShopCategory) => void;
  setSortOption: (option: ShopSortOption) => void;
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
      products: shopProducts,
      cart: [],
      selectedCategory: "all",
      sortOption: "none",

      setCategory: (category) => set({ selectedCategory: category }),
      setSortOption: (option) => set({ sortOption: option }),

      getProductById: (productId: string) => {
        return get().products.find((product) => product.id === productId);
      },

      getVisibleProducts: () => {
        const { products, selectedCategory, sortOption } = get();
        const filtered =
          selectedCategory === "all"
            ? products
            : products.filter(
                (product) => product.category === selectedCategory,
              );
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
