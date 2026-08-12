"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, GraduationCap, Sprout } from "lucide-react";

export default function AboutSection() {
  return (
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
              d&apos;agri-preneurs capables de relever les défis alimentaires de
              notre continent.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border border-border/50">
                <div className="p-2 bg-secondary/20 rounded-lg text-primary">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Durable
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pratiques respectueuses de l&apos;environnement
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border border-border/50">
                <div className="p-2 bg-secondary/20 rounded-lg text-primary">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Formation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Transmission de savoir-faire pratique
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-full max-w-[520px] mx-auto md:mx-0 md:ml-auto">
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
                className="group relative z-10 overflow-hidden rounded-4xl md:rounded-[2.5rem] shadow-sm ring-1 ring-black/5 will-change-transform aspect-4/5 md:aspect-square"
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
  );
}
