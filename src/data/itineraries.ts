const commonPhytoMeta = {
  frequency: "Application preventive: 1 fois par semaine",
  emergencyFrequency: "En cas d'attaque: jusqu'a 2 fois par semaine",
  disclaimer:
    "Veuillez lire la notice d'emballage et respecter la dose des produits phytosanitaires.",
} satisfies Pick<ItineraryPhytoProtocol, "frequency" | "emergencyFrequency" | "disclaimer">;

const tomateProgram: ItineraryProgramDefinition = {
  scheduleType: "weekly",
  fertilization: [
    {
      id: "tomate-s1-s2",
      label: "Semaines 1 a 2",
      schedule: "S1-S2",
      doses: [
        { product: "MAP", dose: 5, unit: "kg" },
        { product: "Nitrate de calcium", dose: 8, unit: "kg" },
        { product: "Nitrate de potassium", dose: 5, unit: "kg" },
        { product: "Sulfate de magnesium", dose: 4, unit: "kg" },
      ],
    },
    {
      id: "tomate-s3-s4",
      label: "Semaines 3 a 4",
      schedule: "S3-S4",
      doses: [
        { product: "MAP", dose: 3, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
        { product: "Nitrate de potassium", dose: 10, unit: "kg" },
        { product: "Sulfate de magnesium", dose: 5, unit: "kg" },
      ],
    },
    {
      id: "tomate-s5-s6",
      label: "Semaines 5 a 6",
      schedule: "S5-S6",
      doses: [
        { product: "MAP", dose: 2, unit: "kg" },
        { product: "Nitrate de calcium", dose: 14, unit: "kg" },
        { product: "Nitrate de potassium", dose: 15, unit: "kg" },
        { product: "Sulfate de magnesium", dose: 6, unit: "kg" },
      ],
    },
    {
      id: "tomate-s7-s9",
      label: "Semaines 7 a 9",
      schedule: "S7-S9",
      doses: [
        { product: "MAP", dose: 1, unit: "kg" },
        { product: "Nitrate de calcium", dose: 15, unit: "kg" },
        { product: "Nitrate de potassium", dose: 22, unit: "kg" },
        { product: "Sulfate de magnesium", dose: 7, unit: "kg" },
      ],
    },
    {
      id: "tomate-s10-s12",
      label: "Semaines 10 a 12",
      schedule: "S10-S12",
      doses: [
        { product: "MAP", dose: 0, unit: "kg" },
        { product: "Nitrate de calcium", dose: 10, unit: "kg" },
        { product: "Nitrate de potassium", dose: 25, unit: "kg" },
        { product: "Sulfate de magnesium", dose: 5, unit: "kg" },
      ],
    },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      {
        id: "insecticides",
        label: "Insecticides",
        products: ["ARSENAL", "ABAMEK"],
      },
      {
        id: "nematicides",
        label: "Nematicides",
        products: ["VIDAMYL", "NEMA B2"],
      },
      {
        id: "fungicides",
        label: "Fongicides",
        products: ["CUIVRE", "SOUFRE", "ATHLETE"],
      },
      {
        id: "acaricides",
        label: "Acaricides",
        products: ["ETOILE", "DICOFORT"],
      },
      {
        id: "complements",
        label: "Complements",
        products: ["BORE", "ACIDE HUMIQUE"],
      },
      {
        id: "acides-amines",
        label: "Acide amine",
        products: ["SMARTFOIL"],
      },
    ],
  },
};

const pimentProgram: ItineraryProgramDefinition = {
  scheduleType: "weekly",
  fertilization: [
    {
      id: "piment-s1",
      label: "Semaine 1",
      schedule: "S1",
      doses: [{ product: "MAP", dose: 8, unit: "kg" }],
    },
    {
      id: "piment-s2",
      label: "Semaine 2",
      schedule: "S2",
      doses: [{ product: "Uree", dose: 8, unit: "kg" }],
    },
    {
      id: "piment-s3",
      label: "Semaine 3",
      schedule: "S3",
      doses: [
        { product: "MAP", dose: 6, unit: "kg" },
        { product: "Magnesium", dose: 6, unit: "kg" },
      ],
    },
    {
      id: "piment-s4",
      label: "Semaine 4",
      schedule: "S4",
      doses: [
        { product: "Uree", dose: 6, unit: "kg" },
        { product: "NPK", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s5",
      label: "Semaine 5",
      schedule: "S5",
      doses: [
        { product: "Uree", dose: 10, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s6",
      label: "Semaine 6",
      schedule: "S6",
      doses: [
        { product: "Uree", dose: 6, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s7",
      label: "Semaine 7",
      schedule: "S7",
      doses: [
        { product: "Magnesium", dose: 9, unit: "kg" },
        { product: "NPK", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s8",
      label: "Semaine 8",
      schedule: "S8",
      doses: [
        { product: "Uree", dose: 15, unit: "kg" },
        { product: "Nitrate de calcium", dose: 12, unit: "kg" },
      ],
    },
    {
      id: "piment-s9",
      label: "Semaine 9",
      schedule: "S9",
      doses: [{ product: "Potassium", dose: 12, unit: "kg" }],
    },
    {
      id: "piment-s10",
      label: "Semaine 10",
      schedule: "S10",
      doses: [{ product: "Potassium", dose: 10, unit: "kg" }],
    },
    {
      id: "piment-s11",
      label: "Semaine 11",
      schedule: "S11",
      doses: [{ product: "Potassium", dose: 10, unit: "kg" }],
    },
    {
      id: "piment-s12",
      label: "Semaine 12",
      schedule: "S12",
      doses: [{ product: "Potassium", dose: 10, unit: "kg" }],
    },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      {
        id: "insecticides",
        label: "Insecticides",
        products: ["ARSENAL", "MALATHION"],
      },
      {
        id: "nematicides",
        label: "Nematicides",
        products: ["VIDAMYL", "NEMA B2"],
      },
      {
        id: "fungicides",
        label: "Fongicides",
        products: ["CUIVRE", "SOUFRE", "ATHLETE"],
      },
      {
        id: "acaricides",
        label: "Acaricides",
        products: ["ABAMEK", "DICOFORT"],
      },
      {
        id: "complements",
        label: "Complements",
        products: ["BORE", "ACIDE HUMIQUE"],
      },
      {
        id: "acides-amines",
        label: "Acide amine",
        products: ["SMARTFOIL"],
      },
    ],
  },
};

const aubergineProgram: ItineraryProgramDefinition = {
  scheduleType: "stage",
  fertilization: [
    {
      id: "aubergine-installation",
      label: "Installation",
      schedule: "0 a 4 semaines",
      doses: [
        { product: "Uree", dose: 436.46, unit: "g" },
        { product: "MAP", dose: 327.8, unit: "g" },
        { product: "Nitrate de calcium", dose: 762.2, unit: "g" },
        { product: "Nitrate de potassium", dose: 1086, unit: "g" },
        { product: "Sulfate de magnesium", dose: 312.5, unit: "g" },
      ],
    },
    {
      id: "aubergine-croissance",
      label: "Croissance",
      schedule: "5 a 8 semaines",
      doses: [
        { product: "Uree", dose: 995, unit: "g" },
        { product: "MAP", dose: 819.67, unit: "g" },
        { product: "Nitrate de calcium", dose: 3846.15, unit: "g" },
        { product: "Nitrate de potassium", dose: 6521.74, unit: "g" },
        { product: "Sulfate de magnesium", dose: 1875, unit: "g" },
      ],
    },
    {
      id: "aubergine-floraison",
      label: "Floraison",
      schedule: "9 a 12 semaines",
      doses: [
        { product: "Uree", dose: 1130.18, unit: "g" },
        { product: "MAP", dose: 1311.47, unit: "g" },
        { product: "Nitrate de calcium", dose: 7692.31, unit: "g" },
        { product: "Nitrate de potassium", dose: 8695.65, unit: "g" },
        { product: "Sulfate de magnesium", dose: 3125, unit: "g" },
      ],
    },
    {
      id: "aubergine-production",
      label: "Production",
      schedule: "Au-dela de 12 semaines",
      doses: [
        { product: "Uree", dose: 2735.97, unit: "g" },
        { product: "MAP", dose: 1639.34, unit: "g" },
        { product: "Nitrate de calcium", dose: 9615.38, unit: "g" },
        { product: "Nitrate de potassium", dose: 11956.52, unit: "g" },
        { product: "Sulfate de magnesium", dose: 3750, unit: "g" },
      ],
    },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      {
        id: "insecticides",
        label: "Insecticides",
        products: ["ARSENAL", "ABAMEK"],
      },
      {
        id: "nematicides",
        label: "Nematicides",
        products: ["VIDAMYL", "NEMA B2"],
      },
      {
        id: "fungicides",
        label: "Fongicides",
        products: ["CUIVRE", "SOUFRE", "ATHLETE"],
      },
      {
        id: "acaricides",
        label: "Acaricides",
        products: ["ETOILE", "DICOFORT"],
      },
      {
        id: "complements",
        label: "Complements",
        products: ["BORE", "ACIDE HUMIQUE"],
      },
      {
        id: "acides-amines",
        label: "Acide amine",
        products: ["SMARTFOIL"],
      },
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
        { product: "Sulfate de magnesium", dose: 520, unit: "g" },
        { product: "Nitrate de potassium", dose: 600, unit: "g" },
        { product: "MAP", dose: 250.1, unit: "g" },
        { product: "Uree", dose: 300, unit: "g" },
        { product: "Nitrate de calcium", dose: 1100, unit: "g" },
        { product: "Acide nitrique", dose: 200, unit: "ml" },
      ],
    },
    {
      id: "concombre-phase-2",
      label: "Phase 2",
      schedule: "15 jours suivants",
      doses: [
        { product: "Sulfate de magnesium", dose: 520, unit: "g" },
        { product: "Nitrate de potassium", dose: 800, unit: "g" },
        { product: "MAP", dose: 250.1, unit: "g" },
        { product: "Uree", dose: 300, unit: "g" },
        { product: "Nitrate de calcium", dose: 1100, unit: "g" },
        { product: "Acide nitrique", dose: 200, unit: "ml" },
        { product: "NPK 10-10-20", dose: 1333, unit: "g" },
      ],
    },
    {
      id: "concombre-phase-3",
      label: "Phase 3",
      schedule: "Debut recolte jusqu'a la fin",
      doses: [
        { product: "Sulfate de magnesium", dose: 520, unit: "g" },
        { product: "Nitrate de potassium", dose: 1000, unit: "g" },
        { product: "MAP", dose: 250.1, unit: "g" },
        { product: "Uree", dose: 200, unit: "g" },
        { product: "Nitrate de calcium", dose: 1100, unit: "g" },
        { product: "Acide nitrique", dose: 200, unit: "ml" },
        { product: "NPK 10-10-20", dose: 1333, unit: "g" },
      ],
    },
  ],
  phyto: {
    ...commonPhytoMeta,
    categories: [
      {
        id: "insecticides",
        label: "Insecticides",
        products: ["ARSENAL", "ABAMEK"],
      },
      {
        id: "nematicides",
        label: "Nematicides",
        products: ["VIDAT", "NEMA B2"],
      },
      {
        id: "fungicides",
        label: "Fongicides",
        products: ["CUIVRE", "SOUFRE"],
      },
      {
        id: "acaricides",
        label: "Acaricides",
        products: ["ABAMEK", "DICOFORT"],
        notes: "La fiche concombre ne detaille pas clairement la ligne acaricide.",
      },
      {
        id: "complements",
        label: "Complements",
        products: ["BORE", "ACIDE HUMIQUE"],
      },
      {
        id: "acides-amines",
        label: "Acide amine",
        products: ["Acide amine"],
      },
    ],
  },
  notes: [
    "Programme source serre: application soluble 6 jours sur 7.",
    "La variante plein champ n'etait pas fournie dans les PDF source.",
  ],
};

const poivronProgram: ItineraryProgramDefinition = {
  ...pimentProgram,
  notes: [
    "Source PDF combinee poivron/piment: valeurs poivron alignees sur le programme piment.",
  ],
};

export const technicalItineraries: CropItineraryDefinition[] = [
  {
    id: "tomate",
    cropName: "Tomate",
    baselineAreaM2: 1000,
    sourcePdf: ["docs/Itinéraire tomate 1000 m2.pdf"],
    supportedMethods: ["serre", "plein_champ"],
    defaultProgram: tomateProgram,
  },
  {
    id: "aubergine",
    cropName: "Aubergine",
    baselineAreaM2: 1000,
    sourcePdf: ["docs/Itinéraire Aubergine 1000 m2.pdf"],
    supportedMethods: ["serre", "plein_champ"],
    defaultProgram: aubergineProgram,
  },
  {
    id: "piment",
    cropName: "Piment",
    baselineAreaM2: 1000,
    sourcePdf: ["docs/Itinéraire poivron et piment 1000 m2.pdf"],
    supportedMethods: ["serre", "plein_champ"],
    defaultProgram: pimentProgram,
  },
  {
    id: "concombre",
    cropName: "Concombre",
    baselineAreaM2: 1000,
    sourcePdf: ["docs/Itinéraire concombre 1000 m2.pdf"],
    supportedMethods: ["serre", "plein_champ"],
    defaultProgram: concombreProgram,
  },
  {
    id: "poivron",
    cropName: "Poivron",
    baselineAreaM2: 1000,
    sourcePdf: ["docs/Itinéraire poivron et piment 1000 m2.pdf"],
    supportedMethods: ["serre", "plein_champ"],
    defaultProgram: poivronProgram,
  },
];

const itineraryById = technicalItineraries.reduce<Record<string, CropItineraryDefinition>>(
  (accumulator, itinerary) => {
    accumulator[itinerary.id] = itinerary;
    return accumulator;
  },
  {},
);

export function getTechnicalItineraryById(cropId: string) {
  return itineraryById[cropId];
}

export function getTechnicalItineraryOptions() {
  return technicalItineraries.map((itinerary) => ({
    label: itinerary.cropName,
    value: itinerary.id,
  }));
}

export const itineraryMethodOptions: { label: string; value: ItineraryMethod }[] = [
  { label: "Serre", value: "serre" },
  { label: "Plein champ", value: "plein_champ" },
];
