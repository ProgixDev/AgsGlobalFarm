"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  getCartItemId,
  getCartItemImage,
  getCartItemPrice,
} from "@/lib/cart-utils";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();

  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const validateField = (field: string, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: "Ce champ est requis" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
    return true;
  };

  const handlePayment = async () => {
    // Validate all fields
    const isValid =
      validateField("street", addressForm.street) &&
      validateField("city", addressForm.city) &&
      validateField("country", addressForm.country) &&
      validateField("phone", addressForm.phone);

    if (!isValid) {
      setError("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          user,
          address: addressForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de l'initialisation du paiement",
        );
      }

      // Redirect to Paydunya payment page
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Veuillez vous connecter</h1>
          <Link href="/login?redirect=/checkout">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
          <Link href="/boutique">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Continuer les achats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Articles dans votre panier
              </h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <motion.div
                    key={getCartItemId(item)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-green-50 shrink-0 border border-gray-100">
                        <Image
                          src={getCartItemImage(item)}
                          alt={"name" in item ? item.name : item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1.5 text-sm line-clamp-2">
                          {"name" in item ? item.name : item.title}
                        </h3>
                        <p className="text-base font-bold text-green-600 mb-3">
                          {getCartItemPrice(item).toLocaleString()} FCFA
                        </p>
                        <div className="flex items-center justify-between">
                          {"priceTTC" in item && (
                            <span className="text-sm text-gray-600">
                              Quantité: {item.quantity}
                            </span>
                          )}
                        </div>
                        {/* Subtotal */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Sous-total:{" "}
                            <span className="font-bold text-gray-900">
                              {(
                                getCartItemPrice(item) * item.quantity
                              ).toLocaleString()}{" "}
                              FCFA
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Form and Summary - Takes up 1 column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Récapitulatif
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-sm font-medium">Sous-total</span>
                  <span className="font-semibold">
                    {cartTotal.toLocaleString()} FCFA
                  </span>
                </div>
                {cart.some((item) => "name" in item) && (
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
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    {cartTotal.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Informations de livraison
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    {user.firstName} {user.lastName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    {user.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <textarea
                    name="street"
                    value={addressForm.street}
                    onChange={(e) => {
                      setAddressForm({
                        ...addressForm,
                        street: e.target.value,
                      });
                      if (errors.street) setErrors({ ...errors, street: "" });
                    }}
                    onBlur={() => validateField("street", addressForm.street)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                    rows={3}
                    placeholder="Votre adresse complète"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm({
                          ...addressForm,
                          city: e.target.value,
                        });
                        if (errors.city) setErrors({ ...errors, city: "" });
                      }}
                      onBlur={() => validateField("city", addressForm.city)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Ville"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={(e) => {
                        setAddressForm({
                          ...addressForm,
                          postalCode: e.target.value,
                        });
                        if (errors.postalCode)
                          setErrors({ ...errors, postalCode: "" });
                      }}
                      onBlur={() => {
                        // Optional field, but if filled, could validate format, but for now just clear
                        if (errors.postalCode)
                          setErrors({ ...errors, postalCode: "" });
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.postalCode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Code postal"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={addressForm.country}
                    onChange={(e) => {
                      setAddressForm({
                        ...addressForm,
                        country: e.target.value,
                      });
                      if (errors.country) setErrors({ ...errors, country: "" });
                    }}
                    onBlur={() => validateField("country", addressForm.country)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Pays"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={addressForm.phone}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    onBlur={() => validateField("phone", addressForm.phone)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Votre numéro de téléphone"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Save as Default Address */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveAsDefault"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="saveAsDefault"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Enregistrer cette adresse comme adresse par défaut
                  </label>
                </div>
              </form>
            </div>

            {/* Payment Button */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {isProcessing ? "Traitement..." : "Payer maintenant"}
              </Button>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                {cart.some((item) => "name" in item) && (
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
          </div>
        </div>
      </div>
    </div>
  );
}
