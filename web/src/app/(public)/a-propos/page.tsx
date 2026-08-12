"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";

export default function AProposPage() {
  const galleryImages = [
    "Drone.png",
    "Pepers.jpeg",
    "BlackManExplainingTwo.png",
    "Pickles2.jpeg",
    "BlackManWithBags.png",
    "Pickles.png",
    "BlackManExplaining.png",
    "TwoBlackPplTalking.png",
    "Tomato.png",
    "TomatoManSmile.jpeg",
    "AnotherDrone.png",
  ];

  // Pattern: Column 1: tall tall short | Column 2: short tall tall | Column 3: tall tall short | Column 4: tall short tall | Column 5: short tall tall
  // Short images at indices: 2, 3, 8, 10, 12
  const shortImageIndices = [2, 3, 8, 10, 12];

  return (
    <div className="min-h-screen">
      {/* About Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6"
                style={{
                  backgroundColor: "var(--color-secondary-brand, #f59e0b)20",
                  color: "var(--color-secondary-brand, #f59e0b)",
                }}
              >
                <Sprout
                  className="w-4 h-4"
                  style={{ color: "var(--color-secondary-brand, #f59e0b)" }}
                />
                À propos de nous
              </div>
              <h2
                className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
                style={{ color: "var(--color-brand, #16a34a)" }}
              >
                L&apos;agriculture de demain se cultive aujourd&apos;hui
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                AGROPASTORAL GLOBALE FARMS est bien plus qu&apos;une simple
                exploitation agricole. Nous sommes un centre d&apos;innovation
                dédié à la transformation de l&apos;agriculture en Afrique.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Notre mission est double : produire de manière durable grâce aux
                technologies modernes, et former la prochaine génération
                d&apos;agri-preneurs capables de relever les défis alimentaires
                de notre continent.
              </p>
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative w-full max-w-130 mx-auto md:mx-0 md:ml-auto">
                {/* Accent rounded frame behind the image */}
                <div
                  className="absolute -inset-2 sm:-inset-3 md:-inset-4 rounded-[2.25rem] md:rounded-[3.5rem] border-[6px] sm:border-8 md:border-10 opacity-60"
                  style={{ borderColor: "#f59e0b40" }}
                  aria-hidden="true"
                />

                <motion.figure
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  whileHover={{ y: 0 }}
                  className="group relative z-10 overflow-hidden rounded-4xl md:rounded-[2.5rem] shadow-sm ring-1 ring-black/5 will-change-transform aspect-4/3 md:aspect-4/3"
                >
                  <Image
                    src="/BlackManWithPlants.png"
                    alt="Agriculture Moderne"
                    fill
                    className="object-cover object-center origin-center transition-transform duration-300 group-hover:scale-105 will-change-transform"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                </motion.figure>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-4 px-4 md:py-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="columns-3 md:columns-5 gap-2 md:gap-4 w-full">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="block mb-2 md:mb-4 break-inside-avoid"
              >
                <div
                  className={`relative overflow-hidden rounded-md md:rounded-lg shadow-sm md:shadow-md ${
                    shortImageIndices.includes(index)
                      ? "h-[180px] md:h-[200px]"
                      : "min-h-[280px] md:min-h-[320px]"
                  }`}
                >
                  <Image
                    src={`/${image}`}
                    alt={`AGROPASTORAL GLOBALE FARMS - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
