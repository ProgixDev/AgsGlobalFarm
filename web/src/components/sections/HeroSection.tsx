"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

export default function HeroSection() {
  // Using placeholder images that exist in the project or generic ones
  const images = [
    {
      src: "/BlackManWithBagsTwo.png", // Using existing image
      alt: "Jeune femme souriante",
    },
    {
      src: "/Pickles.png", // Using existing image
      alt: "Jeune homme avec lunettes",
    },
    {
      src: "/BlackManWithPlants.png", // Using existing image
      alt: "Jeune femme rousse",
    },
    {
      src: "/Drone.png", // Using existing image
      alt: "Jeune homme souriant",
    },
    {
      src: "/TwoBlackPplTalking.png", // Using existing image
      alt: "Jeune femme asiatique",
    },
  ];

  // Background color mapping by logical image order and mirrored counterpart
  const getLeftBg = (colIdx: number, itemIdx: number): string => {
    if (colIdx === 0 && itemIdx === 0) return "#94A3B8"; // 1st
    if (colIdx === 1 && itemIdx === 0) return "var(--color-secondary-brand)"; // 2nd (was #F4B840)
    if (colIdx === 1 && itemIdx === 1) return "#60D3D959"; // 3rd
    if (colIdx === 2 && itemIdx === 0) return "#D2EBBE"; // 4th
    if (colIdx === 2 && itemIdx === 1) return "#A5BD92"; // 5th
    return "var(--color-lavender)";
  };

  const getRightBg = (colIdx: number, itemIdx: number): string => {
    if (colIdx === 2 && itemIdx === 0) return "#94A3B8"; // mirror of 1st
    if (colIdx === 1 && itemIdx === 1) return "var(--color-secondary-brand)"; // mirror of 2nd
    if (colIdx === 1 && itemIdx === 0) return "#60D3D959"; // mirror of 3rd
    if (colIdx === 0 && itemIdx === 1) return "#D2EBBE"; // mirror of 4th
    if (colIdx === 0 && itemIdx === 0) return "#A5BD92"; // mirror of 5th
    return "var(--color-mint)";
  };

  // Column structures for perfect mirrored symmetry
  const leftStructure = [
    { count: 1, heights: ["h-[16rem] md:h-[22rem]"] },
    { count: 2, heights: ["h-[10rem] md:h-[18rem]", "h-[12rem] md:h-[10rem]"] },
    { count: 2, heights: ["h-[12rem] md:h-[10rem]", "h-[10rem] md:h-[18rem]"] },
  ];
  const rightStructure = [...leftStructure].reverse();

  // Helper to distribute images across columns, repeating when needed
  function buildColumns(structure: { count: number; heights: string[] }[]) {
    const cols: { src: string; alt: string; heightClass: string }[][] = [];
    let i = 0;
    for (const col of structure) {
      const items: { src: string; alt: string; heightClass: string }[] = [];
      for (let j = 0; j < col.count; j++) {
        const img = images[i % images.length];
        const heightClass =
          col.heights[j] ?? col.heights[col.heights.length - 1];
        items.push({ src: img.src, alt: img.alt, heightClass });
        i++;
      }
      cols.push(items);
    }
    return cols;
  }

  const leftColumns = buildColumns(leftStructure);
  const rightColumns = leftColumns.map((_, colIdx) => {
    const mirroredLeftCol = leftColumns[leftColumns.length - 1 - colIdx];
    const isPair = mirroredLeftCol.length === 2;
    const reordered = isPair ? [...mirroredLeftCol].reverse() : mirroredLeftCol;
    const leftHeights = mirroredLeftCol.map((it) => it.heightClass);

    return reordered.map((item, itemIdx) => ({
      src: item.src,
      alt: item.alt,
      heightClass: isPair
        ? leftHeights[leftHeights.length - 1 - itemIdx]
        : (rightStructure[colIdx].heights[itemIdx] ??
          rightStructure[colIdx].heights[
            rightStructure[colIdx].heights.length - 1
          ]),
    }));
  });

  return (
    <section className="relative mb-16 md:mb-24 lg:mb-28">
      {/* Heading */}
      <div className="max-w-4xl mx-auto pt-8 sm:pt-10 md:pt-14 text-center px-4">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight"
          style={{ color: "var(--color-brand)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          AGROPASTORAL GLOBALE FARMS
        </motion.h1>
        {/* Prominent slogan near the site name */}
        <motion.div
          className="mt-3"
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          <span
            className="inline-block text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{
              color: "var(--color-secondary-brand)",
              textShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            aria-label="Slogan: Cultivons l'avenir ensemble"
          >
            Cultivons l&apos;avenir ensemble
          </span>
        </motion.div>
        <motion.p
          className="mt-4 text-sm sm:text-[15px] md:text-lg leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          Solutions agricoles innovantes pour des récoltes abondantes et un
          avenir durable. Nous accompagnons les agriculteurs vers une production
          plus responsable et plus performante.
        </motion.p>
      </div>

      {/* Symmetric mirrored masonry */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
          {/* Left half */}
          <div className="grid grid-cols-3 gap-4 md:gap-5 order-2 md:order-1">
            {leftColumns.map((col, colIdx) => (
              <motion.div
                key={`left-col-${colIdx}`}
                className={`flex flex-col gap-4 md:gap-5 ${
                  col.length === 1 ? "h-92 md:h-117 justify-center" : ""
                } ${colIdx % 2 === 0 ? "motion-up" : "motion-down"}`}
                style={
                  {
                    "--motion-duration":
                      colIdx === 0 ? "9s" : colIdx === 1 ? "7.5s" : "6s",
                    "--motion-delay":
                      colIdx === 0 ? "0.2s" : colIdx === 1 ? "0.8s" : "1.4s",
                  } as CSSProperties &
                    Record<"--motion-duration" | "--motion-delay", string>
                }
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {col.map((item, itemIdx) => (
                  <motion.figure
                    key={`left-${colIdx}-${itemIdx}`}
                    className={`group relative w-full ${item.heightClass} rounded-[4rem] overflow-hidden shadow-sm ring-1 ring-black/5 bg-(--color-lavender)`}
                    style={{ backgroundColor: getLeftBg(colIdx, itemIdx) }}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 560px"
                      priority={colIdx === 0 && itemIdx === 0}
                    />
                  </motion.figure>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Right half (mirrored) */}
          <div className="grid grid-cols-3 gap-4 md:gap-5 order-1 md:order-2">
            {rightColumns.map((col, colIdx) => (
              <motion.div
                key={`right-col-${colIdx}`}
                className={`flex flex-col gap-4 md:gap-5 ${
                  col.length === 1 ? "h-92 md:h-117 justify-center" : ""
                } ${colIdx % 2 === 0 ? "motion-up" : "motion-down"}`}
                style={
                  {
                    "--motion-duration":
                      colIdx === 0 ? "8.5s" : colIdx === 1 ? "7s" : "6.25s",
                    "--motion-delay":
                      colIdx === 0 ? "0.5s" : colIdx === 1 ? "0.1s" : "1.1s",
                  } as CSSProperties &
                    Record<"--motion-duration" | "--motion-delay", string>
                }
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {col.map((item, itemIdx) => (
                  <motion.figure
                    key={`right-${colIdx}-${itemIdx}`}
                    className={`group relative w-full ${item.heightClass} rounded-[4rem] overflow-hidden shadow-sm ring-1 ring-black/5 bg-(--color-mint)`}
                    style={{ backgroundColor: getRightBg(colIdx, itemIdx) }}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 560px"
                    />
                  </motion.figure>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
