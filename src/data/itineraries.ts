const commonPhytoMeta = {
  frequency: "Application préventive : 1 fois par semaine",
  emergencyFrequency: "En cas d'attaque : jusqu'à 2 fois par semaine",
  disclaimer:
    "Veuillez lire la notice d'emballage et respecter la dose des produits phytosanitaires.",
} satisfies Pick<
  ItineraryPhytoProtocol,
  "frequency" | "emergencyFrequency" | "disclaimer"
>;

const tomateProgram: ItineraryProgramDefinition = {
  scheduleType: "weekly",
  fertilization: [
    {
      id: "tomate-s1-s2",
      label: "Semaines 1 à 2",
      schedule: "S1-S2",
      doses: [
        { product: "MAP", dose: 5, unit: "kg" },
        { product: "Nitrate de calcium", dose: 8, unit: "kg" },
        { product: "Nitrate de potassium", dose: 5, unit: "kg" },
        { product: "Sulfate de magnésium", dose: 4, unit: "kg" },
      ],
    },
    {
      id: "tomate-s3-s4",
      label: "Semaines 3 à 4",
      schedule: "S3-S4",
      doses: [
        { product: "MAP", dose: 3, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
        { product: "Nitrate de potassium", dose: 10, unit: "kg" },
        { product: "Sulfate de magnésium", dose: 5, unit: "kg" },
      ],
    },
    {
      id: "tomate-s5-s6",
      label: "Semaines 5 à 6",
      schedule: "S5-S6",
      doses: [
        { product: "MAP", dose: 2, unit: "kg" },
        { product: "Nitrate de calcium", dose: 14, unit: "kg" },
        { product: "Nitrate de potassium", dose: 15, unit: "kg" },
        { product: "Sulfate de magnésium", dose: 6, unit: "kg" },
      ],
    },
    {
      id: "tomate-s7-s9",
      label: "Semaines 7 à 9",
      schedule: "S7-S9",
      doses: [
        { product: "MAP", dose: 1, unit: "kg" },
        { product: "Nitrate de calcium", dose: 15, unit: "kg" },
        { product: "Nitrate de potassium", dose: 22, unit: "kg" },
        { product: "Sulfate de magnésium", dose: 7, unit: "kg" },
      ],
    },
    {
      id: "tomate-s10-s12",
      label: "Semaines 10 à 12",
      schedule: "S10-S12",
      doses: [
        { product: "MAP", dose: 0, unit: "kg" },
        { product: "Nitrate de calcium", dose: 10, unit: "kg" },
        { product: "Nitrate de potassium", dose: 25, unit: "kg" },
        { product: "Sulfate de magnésium", dose: 5, unit: "kg" },
      ],
    },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      { id: "insecticides", label: "Insecticides", products: ["ARSENAL", "ABAMEK"] },
      { id: "nematicides", label: "Nématicides", products: ["VIDAMYL", "NEMA B2"] },
      { id: "fungicides", label: "Fongicides", products: ["CUIVRE", "SOUFRE", "ATHLETE"] },
      { id: "acaricides", label: "Acaricides", products: ["ETOILE", "DICOFORT"] },
      { id: "complements", label: "Compléments", products: ["BORE", "ACIDE HUMIQUE"] },
      { id: "acides-amines", label: "Acide aminée", products: ["SMARTFOIL"] },
    ],
  },
};

const pimentProgram: ItineraryProgramDefinition = {
  scheduleType: "weekly",
  fertilization: [
    { id: "piment-s1", label: "Semaine 1", schedule: "S1", doses: [{ product: "MAP", dose: 8, unit: "kg" }] },
    { id: "piment-s2", label: "Semaine 2", schedule: "S2", doses: [{ product: "Urée", dose: 8, unit: "kg" }] },
    {
      id: "piment-s3",
      label: "Semaine 3",
      schedule: "S3",
      doses: [
        { product: "MAP", dose: 6, unit: "kg" },
        { product: "Magnésium", dose: 6, unit: "kg" },
      ],
    },
    {
      id: "piment-s4",
      label: "Semaine 4",
      schedule: "S4",
      doses: [
        { product: "Urée", dose: 6, unit: "kg" },
        { product: "NPK", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s5",
      label: "Semaine 5",
      schedule: "S5",
      doses: [
        { product: "Urée", dose: 10, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s6",
      label: "Semaine 6",
      schedule: "S6",
      doses: [
        { product: "Urée", dose: 6, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s7",
      label: "Semaine 7",
      schedule: "S7",
      doses: [
        { product: "Magnésium", dose: 9, unit: "kg" },
        { product: "NPK", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s8",
      label: "Semaine 8",
      schedule: "S8",
      doses: [
        { product: "Urée", dose: 15, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
      ],
    },
    { id: "piment-s9", label: "Semaine 9", schedule: "S9", doses: [{ product: "Potassium", dose: 12, unit: "kg" }] },
    { id: "piment-s10", label: "Semaine 10", schedule: "S10", doses: [{ product: "Potassium", dose: 10, unit: "kg" }] },
    { id: "piment-s11", label: "Semaine 11", schedule: "S11", doses: [{ product: "Potassium", dose: 10, unit: "kg" }] },
    { id: "piment-s12", label: "Semaine 12", schedule: "S12", doses: [{ product: "Potassium", dose: 10, unit: "kg" }] },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      { id: "insecticides", label: "Insecticides", products: ["ARSENAL", "MALATHION"] },
      { id: "nematicides", label: "Nématicides", products: ["VIDAMYL", "NEMA B2"] },
      { id: "fungicides", label: "Fongicides", products: ["CUIVRE", "SOUFRE", "ATHLETE"] },
      { id: "acaricides", label: "Acaricides", products: ["ABAMEK", "DICOFORT"] },
      { id: "complements", label: "Compléments", products: ["BORE", "ACIDE HUMIQUE"] },
      { id: "acides-amines", label: "Acide aminée", products: ["SMARTFOIL"] },
    ],
  },
};

const aubergineProgram: ItineraryProgramDefinition = {
  scheduleType: "stage",
  fertilization: [
    {
      id: "aubergine-installation",
      label: "Installation",
      schedule: "0 à 4 semaines",
      doses: [
        { product: "Urée", dose: 436.46, unit: "g" },
        { product: "MAP", dose: 327.8, unit: "g" },
        { product: "Nitrate de calcium", dose: 762.2, unit: "g" },
        { product: "Nitrate de potassium", dose: 1086, unit: "g" },
        { product: "Sulfate de magnésium", dose: 312.5, unit: "g" },
      ],
    },
    {
      id: "aubergine-croissance",
      label: "Croissance",
      schedule: "5 à 8 semaines",
      doses: [
        { product: "Urée", dose: 995, unit: "g" },
        { product: "MAP", dose: 819.67, unit: "g" },
        { product: "Nitrate de calcium", dose: 3846.15, unit: "g" },
        { product: "Nitrate de potassium", dose: 6521.74, unit: "g" },
        { product: "Sulfate de magnésium", dose: 1875, unit: "g" },
      ],
    },
    {
      id: "aubergine-floraison",
      label: "Floraison",
      schedule: "9 à 12 semaines",
      doses: [
        { product: "Urée", dose: 1130.18, unit: "g" },
        { product: "MAP", dose: 1311.47, unit: "g" },
        { product: "Nitrate de calcium", dose: 7692.31, unit: "g" },
        { product: "Nitrate de potassium", dose: 8695.65, unit: "g" },
        { product: "Sulfate de magnésium", dose: 3125, unit: "g" },
      ],
    },
    {
      id: "aubergine-production",
      label: "Production",
      schedule: "Au-delà de 12 semaines",
      doses: [
        { product: "Urée", dose: 2735.97, unit: "g" },
        { product: "MAP", dose: 1639.34, unit: "g" },
        { product: "Nitrate de calcium", dose: 9615.38, unit: "g" },
        { product: "Nitrate de potassium", dose: 11956.52, unit: "g" },
        { product: "Sulfate de magnésium", dose: 3750, unit: "g" },
      ],
    },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      { id: "insecticides", label: "Insecticides", products: ["ARSENAL", "ABAMEK"] },
      { id: "nematicides", label: "Nématicides", products: ["VIDAMYL", "NEMA B2"] },
      { id: "fungicides", label: "Fongicides", products: ["CUIVRE", "SOUFRE", "ATHLETE"] },
      { id: "acaricides", label: "Acaricides", products: ["ETOILE", "DICOFORT"] },
      { id: "complements", label: "Compléments", products: ["BORE", "ACIDE HUMIQUE"] },
      { id: "acides-amines", label: "Acide aminée", products: ["SMARTFOIL"] },
    ],
  },
};

const concombreProgram: ItineraryProgramDefinition = {
  scheduleType: "phase",
  fertilization: [
    {
      id: "concombre-phase-1",
      label: "Phase 1",
      schedule: "15 premiers jours",
      doses: [
        { product: "Sulfate de magnésium", dose: 520, unit: "g" },
        { product: "Nitrate de potassium", dose: 600, unit: "g" },
        { product: "MAP", dose: 250.1, unit: "g" },
        { product: "Urée", dose: 300, unit: "g" },
        { product: "Nitrate de calcium", dose: 1100, unit: "g" },
        { product: "Acide nitrique", dose: 200, unit: "ml" },
      ],
    },
    {
      id: "concombre-phase-2",
      label: "Phase 2",
      schedule: "15 jours suivants",
      doses: [
        { product: "Sulfate de magnésium", dose: 520, unit: "g" },
        { product: "Nitrate de potassium", dose: 800, unit: "g" },
        { product: "MAP", dose: 250.1, unit: "g" },
        { product: "Urée", dose: 300, unit: "g" },
        { product: "Nitrate de calcium", dose: 1100, unit: "g" },
        { product: "Acide nitrique", dose: 200, unit: "ml" },
        { product: "NPK 10-10-20", dose: 1333, unit: "g" },
      ],
    },
    {
      id: "concombre-phase-3",
      label: "Phase 3",
      schedule: "Début récolte jusqu'à la fin",
      doses: [
        { product: "Sulfate de magnésium", dose: 520, unit: "g" },
        { product: "Nitrate de potassium", dose: 1000, unit: "g" },
        { product: "MAP", dose: 250.1, unit: "g" },
        { product: "Urée", dose: 200, unit: "g" },
        { product: "Nitrate de calcium", dose: 1100, unit: "g" },
        { product: "Acide nitrique", dose: 200, unit: "ml" },
        { product: "NPK 10-10-20", dose: 1333, unit: "g" },
      ],
    },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      { id: "insecticides", label: "Insecticides", products: ["ARSENAL", "ABAMEK"] },
      { id: "nematicides", label: "Nématicides", products: ["VIDAT", "NEMA B2"] },
      { id: "fungicides", label: "Fongicides", products: ["CUIVRE", "SOUFRE"] },
      { id: "complements", label: "Compléments", products: ["BORE", "ACIDE HUMIQUE"] },
      { id: "acides-amines", label: "Acide aminée", products: ["Acide aminée"] },
    ],
  },
  notes: ["Application soluble : 6 jours sur 7 (programme serre 1000 m²)."],
};

export const technicalItineraries: CropItineraryDefinition[] = [
  {
    id: "tomate",
    cropName: "Tomate",
    emoji: "🍅",
    tagline: "Programme 12 semaines, doses en kg",
    baselineAreaM2: 1000,
    sourcePdf: ["Itinéraire tomate 1000 m2.pdf"],
    cultivationNote: "Adapté serre et plein champ.",
    specs: {
      ph: "5,8 – 6,5",
      conductivity: "2,0 – 3,5 mS/cm",
      temperature: "18 – 28 °C",
      cycleDuration: "4 – 5 mois",
      averageYield: "8 – 12 t / 1 000 m²",
      plantSpacing: "0,4 m × 1,0 m — 2 500 pieds / 1 000 m²",
    },
    program: tomateProgram,
  },
  {
    id: "aubergine",
    cropName: "Aubergine",
    emoji: "🍆",
    tagline: "Programme par stade, doses en grammes",
    baselineAreaM2: 1000,
    sourcePdf: ["Itinéraire Aubergine 1000 m2.pdf"],
    cultivationNote: "Adapté serre et plein champ.",
    specs: {
      ph: "5,5 – 6,8",
      conductivity: "1,8 – 3,0 mS/cm",
      temperature: "20 – 30 °C",
      cycleDuration: "5 – 6 mois",
      averageYield: "6 – 9 t / 1 000 m²",
      plantSpacing: "0,5 m × 1,0 m — 2 000 pieds / 1 000 m²",
    },
    program: aubergineProgram,
  },
  {
    id: "piment",
    cropName: "Piment",
    emoji: "🌶️",
    tagline: "Programme 12 semaines, doses en kg",
    baselineAreaM2: 1000,
    sourcePdf: ["Itinéraire poivron et piment 1000 m2.pdf"],
    cultivationNote: "Adapté serre et plein champ.",
    specs: {
      ph: "5,8 – 6,8",
      conductivity: "1,8 – 2,8 mS/cm",
      temperature: "20 – 30 °C",
      cycleDuration: "5 – 7 mois",
      averageYield: "4 – 7 t / 1 000 m²",
      plantSpacing: "0,4 m × 1,0 m — 2 500 pieds / 1 000 m²",
    },
    program: pimentProgram,
  },
  {
    id: "poivron",
    cropName: "Poivron",
    emoji: "🫑",
    tagline: "Même programme que le piment",
    baselineAreaM2: 1000,
    sourcePdf: ["Itinéraire poivron et piment 1000 m2.pdf"],
    cultivationNote: "Programme commun avec le piment.",
    specs: {
      ph: "5,8 – 6,8",
      conductivity: "2,0 – 3,0 mS/cm",
      temperature: "20 – 28 °C",
      cycleDuration: "5 – 6 mois",
      averageYield: "5 – 8 t / 1 000 m²",
      plantSpacing: "0,4 m × 1,0 m — 2 500 pieds / 1 000 m²",
    },
    program: pimentProgram,
  },
  {
    id: "concombre",
    cropName: "Concombre",
    emoji: "🥒",
    tagline: "3 phases, doses en grammes",
    baselineAreaM2: 1000,
    sourcePdf: ["Itinéraire concombre 1000 m2.pdf"],
    cultivationNote: "Programme calibré sous serre uniquement (6 jours sur 7).",
    specs: {
      ph: "6,0 – 6,8",
      conductivity: "2,0 – 3,0 mS/cm",
      temperature: "22 – 30 °C",
      cycleDuration: "2,5 – 3,5 mois",
      averageYield: "10 – 14 t / 1 000 m²",
      plantSpacing: "0,5 m × 1,2 m — 1 600 pieds / 1 000 m²",
    },
    program: concombreProgram,
  },
];

const itineraryById = technicalItineraries.reduce<
  Record<string, CropItineraryDefinition>
>((accumulator, itinerary) => {
  accumulator[itinerary.id] = itinerary;
  return accumulator;
}, {});

export function getTechnicalItineraryById(cropId: string) {
  return itineraryById[cropId];
}
