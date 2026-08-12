"use client";

import { useState, useLayoutEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sprout, Plus, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";
import { storeInfo } from "@/lib/store-info";

interface CategoryOption {
  key: string;
  label: string;
}

interface BoutiqueClientPageProps {
  products: Product[];
  categories: CategoryOption[];
}

export default function BoutiqueClientPage({
  products,
  categories,
}: BoutiqueClientPageProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#faf9f6");

  const { addToCart } = useCart();

  useLayoutEffect(() => {
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBackgroundColor(bodyBg);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "all" || product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-32 overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-brand) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block py-2 px-4 rounded text-white text-sm font-medium mb-4 border"
              style={{
                backgroundColor: "var(--color-secondary-brand)",
                borderColor: "var(--color-secondary-brand)",
              }}
            >
              Intrants agricoles certifiés
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Notre Boutique Agricole
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-10">
              Engrais, semences, produits phytosanitaires et petit matériel
              pour vos exploitations.
            </p>

            <div className="max-w-xl mx-auto">
              <div
                className="flex items-center bg-white rounded-lg p-2 border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Rechercher un produit (ex: NPK, neem...)"
                  className="w-full px-4 py-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-[calc(100%+1.3px)] h-15"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill={backgroundColor}
            ></path>
          </svg>
        </div>
      </section>

      {/* Store Info Banner */}
      <section className="relative -mt-12 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 grid gap-6 md:grid-cols-3 md:items-center">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  Localisation
                </p>
                <a
                  href={storeInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-800 font-medium leading-snug hover:text-emerald-700"
                >
                  {storeInfo.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  Téléphone
                </p>
                <a
                  href={`tel:${storeInfo.phoneTel}`}
                  className="text-sm text-gray-800 font-medium hover:text-emerald-700"
                >
                  {storeInfo.phone}
                </a>
                <p className="text-xs text-gray-500 mt-0.5">
                  {storeInfo.hours}
                </p>
              </div>
            </div>

            <div className="md:justify-self-end w-full md:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <a href={`tel:${storeInfo.phoneTel}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Contacter le fournisseur
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 relative">
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none -mt-1"
          style={{
            background: `linear-gradient(to bottom, ${backgroundColor}, transparent)`,
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nos Produits</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category.key
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full"
                >
                  <div className="relative h-64 bg-green-50 overflow-hidden shrink-0">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {!product.isInStock && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        Rupture
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-12">
                        {product.name}
                      </h3>
                      <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-10">
                      {product.shortDescription}
                    </p>

                    {product.brand && (
                      <p className="text-xs text-gray-500 mb-2">
                        Marque: <span className="font-semibold">{product.brand}</span>
                      </p>
                    )}

                    <div className="flex-1" />

                    <div className="border-t pt-4 mt-auto">
                      <div className="flex items-end justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="text-2xl font-bold text-green-600 leading-tight">
                            {product.priceTTC.toLocaleString()} FCFA
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            par {product.unit}
                          </p>
                        </div>
                        <Button
                          onClick={() => addToCart(product)}
                          disabled={!product.isInStock}
                          className="bg-green-600 hover:bg-green-700 text-white shrink-0 disabled:bg-gray-300"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
