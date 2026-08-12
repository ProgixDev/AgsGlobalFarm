"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  ArrowRight,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  getCartItemId,
  getCartItemImage,
  getCartItemPrice,
} from "@/lib/cart-utils";

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartItemCount,
  } = useCart();

  const handleOrderNow = () => {
    setIsCartOpen(false);
    if (user) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Cart Header */}
            <div className="h-20 border-b bg-green-600 text-white shadow-lg flex items-center">
              <div className="w-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Votre Panier</h2>
                    <p className="text-sm text-white/90 font-medium">
                      {cartItemCount} article{cartItemCount !== 1 && "s"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                  aria-label="Fermer le panier"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Votre panier est vide
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                    Ajoutez des produits frais et biologiques ou des formations
                    à votre panier
                  </p>
                  <Link href="/boutique" onClick={() => setIsCartOpen(false)}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                      Découvrir nos produits
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const itemId = getCartItemId(item);
                    const itemPrice = getCartItemPrice(item);
                    const itemImage = getCartItemImage(item);
                    const isProduct = "priceTTC" in item;
                    const itemKey = item.selectedSessionId
                      ? `${itemId}-${item.selectedSessionId}`
                      : itemId;

                    return (
                      <motion.div
                        key={itemKey}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-green-50 shrink-0 border border-gray-100">
                            <Image
                              src={itemImage}
                              alt={"name" in item ? item.name : item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1.5 text-sm line-clamp-2">
                              {"name" in item ? item.name : item.title}
                            </h3>
                            {/* Show selected session for presentiel formations */}
                            {"title" in item &&
                              item.selectedSessionId &&
                              "sessions" in item &&
                              item.sessions && (
                                <p className="text-xs text-gray-600 mb-1">
                                  Session {item.selectedSessionId}
                                  {(() => {
                                    const session = item.sessions.find(
                                      (s: { id: number }) =>
                                        s.id === item.selectedSessionId,
                                    );
                                    return session ? (
                                      <span className="ml-1">
                                        (
                                        {new Date(
                                          session.startDate,
                                        ).toLocaleDateString()}{" "}
                                        -{" "}
                                        {new Date(
                                          session.endDate,
                                        ).toLocaleDateString()}
                                        )
                                      </span>
                                    ) : null;
                                  })()}
                                </p>
                              )}
                            <p className="text-base font-bold text-green-600 mb-3">
                              {itemPrice.toLocaleString()} FCFA
                            </p>
                            <div className="flex items-center justify-between">
                              {/* Quantity Controls - Only for products */}
                              {isProduct ? (
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                  <button
                                    onClick={() =>
                                      updateQuantity(itemId, item.quantity - 1)
                                    }
                                    className="p-1.5 hover:bg-white rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
                                    aria-label="Diminuer la quantité"
                                  >
                                    <Minus className="w-4 h-4 text-gray-700" />
                                  </button>
                                  <span className="w-10 text-center font-bold text-gray-900 text-sm">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(itemId, item.quantity + 1)
                                    }
                                    className="p-1.5 hover:bg-white rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
                                    aria-label="Augmenter la quantité"
                                  >
                                    <Plus className="w-4 h-4 text-gray-700" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 bg-green-50 px-3 py-1.5 rounded-lg">
                                  Inscription
                                </div>
                              )}
                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(itemId)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                                aria-label="Retirer du panier"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Subtotal */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                Sous-total:{" "}
                                <span className="font-bold text-gray-900">
                                  {(
                                    itemPrice * item.quantity
                                  ).toLocaleString()}{" "}
                                  FCFA
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t bg-white shadow-lg">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="text-sm font-medium">Sous-total</span>
                    <span className="font-semibold">
                      {cartTotal.toLocaleString()} FCFA
                    </span>
                  </div>
                  {cart.some((item) => "priceTTC" in item) && (
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="text-sm font-medium">Livraison</span>
                      <span className="text-green-600 font-bold text-base flex items-center gap-1">
                        <span className="text-xs line-through text-gray-400">
                          2000 FCFA
                        </span>
                        Gratuite
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {cartTotal.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleOrderNow}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  Commander Maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                  {cart.some((item) => "priceTTC" in item) && (
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span>Livraison gratuite</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Paiement sécurisé</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
