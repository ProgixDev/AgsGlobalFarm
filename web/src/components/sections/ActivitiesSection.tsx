"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ActivityCard {
  id: string;
  image: string;
  category: string;
  title: string;
}

export default function ActivitiesSection() {
  const activityCards: ActivityCard[] = [
    {
      id: "1",
      image: "/Pickles.png",
      category: "PRODUCTION",
      title: "Agriculture sous serre",
    },
    {
      id: "2",
      image: "/BlackManWithPlants.png",
      category: "FORMATION",
      title: "Formation pratique sur le terrain",
    },
    {
      id: "3",
      image: "/Drone.png",
      category: "TECHNOLOGIE",
      title: "Cartographie par drone",
    },
    {
      id: "4",
      image: "/BlackManExplaining.png",
      category: "COACHING",
      title: "Accompagnement personnalisé",
    },
    {
      id: "5",
      image: "/TwoBlackPplTalking.png",
      category: "CONSEIL",
      title: "Expertise & Innovation",
    },
  ];

  return (
    <section id="services" className="w-full lg:py-16 py-8">
      {/* Activities Section */}
      <div className="w-full py-20 lg:py-28">
        <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold leading-tight lg:leading-[61px] mb-6"
              style={{ color: "var(--color-brand, #16a34a)" }}
            >
              L&apos;agriculture de demain, partout où l&apos;innovation prend
              racine
            </h2>
            <p
              className="font-bold text-sm py-2 rounded-[18px] transition-colors mb-12"
              style={{
                color: "var(--color-muted, hsl(var(--muted-foreground)))",
              }}
            >
              Des solutions qui transforment votre passion en réussite agricole
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {activityCards.slice(0, 3).map((card, index) => (
              <motion.div
                key={card.id}
                className="flex flex-col gap-7 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={358}
                    height={294}
                    className="w-full h-[294px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p
                    className="text-sm font-bold leading-[21px] tracking-[1px] uppercase"
                    style={{
                      color: "var(--color-secondary-brand, #f59e0b)",
                    }}
                  >
                    {card.category}
                  </p>
                  <h3
                    className="text-[26px] font-bold leading-[33px] group-hover:text-primary transition-colors"
                    style={{
                      color: "var(--foreground, hsl(var(--foreground)))",
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activityCards.slice(3, 5).map((card, index) => (
              <motion.div
                key={card.id}
                className="flex flex-col gap-7 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={358}
                    height={294}
                    className="w-full h-[294px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p
                    className="text-sm font-bold leading-[21px] tracking-[1px] uppercase"
                    style={{
                      color: "var(--color-secondary-brand, #f59e0b)",
                    }}
                  >
                    {card.category}
                  </p>
                  <h3
                    className="text-[26px] font-bold leading-[33px] group-hover:text-primary transition-colors"
                    style={{
                      color: "var(--foreground, hsl(var(--foreground)))",
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
