/**
 * Seeds agricultural incidents.
 * Idempotent: upserts by `title + reporterId`.
 * Owned by seeded farm_owner (Fatou Ndiaye).
 *
 * Usage: bun run scripts/seed-incidents.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import mongoose from "mongoose";
import IncidentModel from "../src/lib/models/Incident";

const FARM_OWNER_EMAIL = "fatou.ndiaye@example.com";

const INCIDENTS = [
  {
    category: "crop_disease" as const,
    title: "Mildiou sur cultures maraîchères",
    description:
      "Le mildiou a été détecté sur plusieurs parcelles de tomates et de pommes de terre dans la zone de Ziguinchor. Les feuilles présentent des taches brunes et un flétrissement rapide. Environ 3 hectares sont touchés.",
    severity: "high" as const,
    coordinates: { longitude: -16.27, latitude: 12.56 },
    region: "Ziguinchor",
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    ],
    daysAgo: 1,
  },
  {
    category: "locusts" as const,
    title: "Invasion de criquets pèlerins",
    description:
      "Des essaims de criquets pèlerins ont été observés dans les champs de mil et de sorgho au nord de Saint-Louis. Les cultures sur environ 15 hectares ont été partiellement détruites.",
    severity: "high" as const,
    coordinates: { longitude: -16.02, latitude: 16.02 },
    region: "Saint-Louis",
    images: [
      "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400",
    ],
    daysAgo: 3,
  },
  {
    category: "flood" as const,
    title: "Inondation des rizières",
    description:
      "Les fortes pluies ont provoqué l'inondation de plusieurs rizières dans le département de Fatick. Les plants de riz sont submergés depuis 3 jours.",
    severity: "medium" as const,
    coordinates: { longitude: -16.41, latitude: 14.33 },
    region: "Fatick",
    images: ["https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400"],
    daysAgo: 5,
  },
  {
    category: "fire" as const,
    title: "Feu de brousse",
    description:
      "Un feu de brousse s'est déclaré à l'est de Tambacounda, menaçant les plantations d'anacardiers et les pâturages. Les pompiers sont sur place.",
    severity: "high" as const,
    coordinates: { longitude: -13.68, latitude: 13.77 },
    region: "Tambacounda",
    images: [
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400",
    ],
    daysAgo: 7,
  },
  {
    category: "pests" as const,
    title: "Pucerons sur arachide",
    description:
      "Une forte infestation de pucerons a été constatée sur les cultures d'arachide dans le bassin arachidier. Les rendements risquent d'être affectés de 30%.",
    severity: "medium" as const,
    coordinates: { longitude: -16.07, latitude: 14.15 },
    region: "Kaolack",
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    ],
    daysAgo: 9,
  },
  {
    category: "drought" as const,
    title: "Sécheresse prolongée",
    description:
      "La saison des pluies est en retard de 3 semaines dans la région de Louga. Les cultures pluviales n'ont pas encore pu être semées.",
    severity: "low" as const,
    coordinates: { longitude: -15.62, latitude: 15.62 },
    region: "Louga",
    images: [
      "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=400",
    ],
    daysAgo: 11,
  },
  {
    category: "pests" as const,
    title: "Chenilles légionnaires d'automne",
    description:
      "Des chenilles légionnaires d'automne ont été identifiées dans les champs de maïs. Les larves se nourrissent des feuilles et des épis en formation.",
    severity: "medium" as const,
    coordinates: { longitude: -15.55, latitude: 14.1 },
    region: "Diourbel",
    images: [
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400",
    ],
    daysAgo: 13,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) throw new Error("DB unavailable");
  const farmOwner = await db
    .collection("user")
    .findOne({ email: FARM_OWNER_EMAIL });
  if (!farmOwner) {
    console.error(
      `Farm owner ${FARM_OWNER_EMAIL} not found. Run seed-test-users.ts first.`,
    );
    process.exit(1);
  }
  const reporterId = String(farmOwner.id ?? farmOwner._id);
  const reporterName = `${farmOwner.firstName ?? ""} ${
    farmOwner.lastName ?? ""
  }`.trim() || farmOwner.email;
  console.log(`Using reporter id: ${reporterId} (${reporterName})`);

  let created = 0;
  let updated = 0;
  for (const seed of INCIDENTS) {
    const { daysAgo, ...incident } = seed;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const existing = await IncidentModel.findOne({
      title: incident.title,
      reporterId,
    });
    if (existing) {
      await IncidentModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            ...incident,
            reporterId,
            reporterName,
            status: "active",
          },
        },
      );
      updated += 1;
      console.log(`- Updated ${incident.title}`);
    } else {
      await IncidentModel.create({
        ...incident,
        reporterId,
        reporterName,
        status: "active",
        createdAt,
        updatedAt: createdAt,
      });
      created += 1;
      console.log(`✓ Created ${incident.title}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
