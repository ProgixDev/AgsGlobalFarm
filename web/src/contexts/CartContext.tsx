"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { Product, Formation, CartItem } from "@/types";
import { getCartItemId, getCartItemPrice } from "@/lib/cart-utils";

type CartContextType = {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Product | Formation, selectedSessionId?: number) => void;
  removeFromCart: (itemId: number | string) => void;
  updateQuantity: (itemId: number | string, newQuantity: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Product | Formation, selectedSessionId?: number) => {
    setCart((prevCart) => {
      const itemId = "priceTTC" in item ? item.id : item._id;
      const existingItem = prevCart.find((cartItem) => {
        const cartItemId = getCartItemId(cartItem);
        // For formations with sessions, also check if same session
        if ("title" in item && selectedSessionId) {
          return (
            cartItemId === itemId &&
            cartItem.selectedSessionId === selectedSessionId
          );
        }
        return cartItemId === itemId;
      });
      if (existingItem) {
        // For formations, don't increase quantity since they are enrollments
        if ("title" in item) {
          return prevCart;
        }
        return prevCart.map((cartItem) => {
          const cartItemId = getCartItemId(cartItem);
          return cartItemId === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem;
        });
      }
      return [
        ...prevCart,
        { ...item, quantity: 1, selectedSessionId: selectedSessionId },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: number | string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => getCartItemId(item) !== itemId),
    );
  };

  const updateQuantity = (itemId: number | string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        getCartItemId(item) === itemId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + getCartItemPrice(item) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
