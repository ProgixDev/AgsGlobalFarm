/**
 * Seeds presential formations.
 * Idempotent: upserts by `title`.
 *
 * Usage: bun run scripts/seed-formations-presential.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import mongoose from "mongoose";
import PresentialFormationModel from "../src/lib/models/PresentialFormation";

const today = new Date();
function daysFromNow(n: number): Date {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
}

const FORMATIONS = [
  {
    title: "Atelier pratique - Irrigation goutte-à-goutte",
    description:
      "Atelier de 3 jours sur le terrain : conception, installation et entretien de systèmes d'irrigation goutte-à-goutte.",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80",
    durationDays: 3,
    level: "intermédiaire",
    price: 75000,
    category: "Production",
    type: "presentiel",
    icon: "water-outline",
    address: "Centre AGS - Keur Ndiaye Lo, Rufisque",
    maxParticipants: 15,
    program: [
      {
        name: "Jour 1 - Conception",
        timeFrames: [
          {
            from: "08:30",
            to: "10:30",
            name: "Accueil et théorie",
            description: "Principes du goutte-à-goutte",
          },
          {
            from: "10:45",
            to: "12:30",
            name: "Calcul des besoins en eau",
          },
          {
            from: "14:00",
            to: "17:00",
            name: "Schéma d'installation",
            description: "Travail en groupes sur cas réels",
          },
        ],
      },
      {
        name: "Jour 2 - Installation",
        timeFrames: [
          {
            from: "08:30",
            to: "12:30",
            name: "Pose sur parcelle",
            description: "Démonstration et pratique",
          },
          {
            from: "14:00",
            to: "17:00",
            name: "Raccordement et tests",
          },
        ],
      },
      {
        name: "Jour 3 - Entretien",
        timeFrames: [
          {
            from: "08:30",
            to: "12:30",
            name: "Maintenance et dépannage",
          },
          {
            from: "14:00",
            to: "16:00",
            name: "Évaluation et certificats",
          },
        ],
      },
    ],
    sessions: [
      {
        id: 1,
        startDate: daysFromNow(15),
        endDate: daysFromNow(17),
        location: "Centre AGS - Keur Ndiaye Lo",
        availableSpots: 15,
        status: "open",
        participants: [],
      },
      {
        id: 2,
        startDate: daysFromNow(45),
        endDate: daysFromNow(47),
        location: "Centre AGS - Keur Ndiaye Lo",
        availableSpots: 15,
        status: "open",
        participants: [],
      },
    ],
  },
  {
    title: "Formation présentielle - Apiculture moderne",
    description:
      "Formation pratique de 2 jours pour démarrer un rucher productif et durable.",
    image:
      "https://images.unsplash.com/photo-1568526381923-caf3fd520382?auto=format&fit=crop&w=800&q=80",
    durationDays: 2,
    level: "débutant",
    price: 50000,
    category: "Élevage",
    type: "presentiel",
    icon: "flower-outline",
    address: "Ferme école AGS - Thiès",
    maxParticipants: 12,
    program: [
      {
        name: "Jour 1 - Théorie et matériel",
        timeFrames: [
          {
            from: "09:00",
            to: "12:00",
            name: "Biologie de l'abeille",
          },
          {
            from: "14:00",
            to: "17:00",
            name: "Ruches, extracteur, équipements",
          },
        ],
      },
      {
        name: "Jour 2 - Pratique",
        timeFrames: [
          {
            from: "08:30",
            to: "12:30",
            name: "Visite de ruche et manipulation",
          },
          {
            from: "14:00",
            to: "16:30",
            name: "Récolte et conditionnement",
          },
        ],
      },
    ],
    sessions: [
      {
        id: 1,
        startDate: daysFromNow(20),
        endDate: daysFromNow(21),
        location: "Ferme école AGS - Thiès",
        availableSpots: 12,
        status: "open",
        participants: [],
      },
    ],
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

  let created = 0;
  let updated = 0;
  for (const formation of FORMATIONS) {
    const existing = await PresentialFormationModel.findOne({
      title: formation.title,
    });
    if (existing) {
      await PresentialFormationModel.updateOne(
        { _id: existing._id },
        { $set: formation },
      );
      updated += 1;
      console.log(`- Updated ${formation.title}`);
    } else {
      await PresentialFormationModel.create(formation);
      created += 1;
      console.log(`✓ Created ${formation.title}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
