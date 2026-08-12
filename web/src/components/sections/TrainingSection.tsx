"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Sprout } from "lucide-react";

export default function TrainingSection() {
  const benefits = [
    "Techniques de culture moderne sous serre",
    "Gestion financière et rentabilité",
    "Technologies agricoles et drones",
    "Marketing et commercialisation",
    "Pratique sur terrain réel",
    "Attestation de fin de formation",
  ];

  return (
    <section className="w-full py-16 px-4" id="formation">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold text-base md:text-lg mb-6"
            style={{
              backgroundColor: "var(--color-secondary-brand, #f59e0b)20",
              color: "var(--color-secondary-brand, #f59e0b)",
            }}
          >
            <Sprout className="w-5 h-5 md:w-6 md:h-6" />
            Formation
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Images Section */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Left Image */}
            <div className="flex-1">
              <Image
                className="w-full h-135 object-cover rounded-lg shadow-lg"
                alt="Formation en serre agricole"
                src="/Pickles.png"
                width={900}
                height={542}
              />
            </div>

            {/* Right Stacked Images */}
            <div className="flex-1 flex flex-col gap-4">
              <Image
                className="w-full h-66 object-cover rounded-lg shadow-lg"
                alt="Technologie drone en agriculture"
                src="/Drone.png"
                width={600}
                height={264}
              />
              <Image
                className="w-full h-66 object-cover rounded-lg shadow-lg"
                alt="Formation pratique terrain"
                src="/BlackManWithPlants.png"
                width={600}
                height={264}
              />
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Badge */}
            <div
              className="inline-block px-6 py-3 rounded-full font-bold text-[17px] text-white transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "var(--color-brand, #16a34a)",
              }}
            >
              Programme
            </div>

            {/* Description */}
            <div className="font-normal text-muted-foreground text-lg leading-9">
              Chez AGROPASTORAL GLOBALE FARMS, nous offrons un programme de
              formation complet conçu pour transformer votre passion en
              expertise professionnelle. De la maîtrise des techniques de
              culture moderne à la gestion d&apos;entreprise agricole, en
              passant par l&apos;utilisation des technologies innovantes, chaque
              module est dispensé par des experts du terrain. Notre approche
              allie théorie avancée et pratique intensive, avec des sessions en
              conditions réelles dans nos installations. Notre objectif : vous
              équiper des compétences nécessaires pour réussir dans
              l&apos;agriculture de demain.
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <CheckCircle2
                    className="w-5 h-5 mt-1 shrink-0"
                    style={{ color: "var(--color-brand, #16a34a)" }}
                  />
                  <span className="text-foreground font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
