/**
 * Seeds jobs.
 * Idempotent: upserts by `title + farmName`.
 * Owned by seeded farm_owner (Fatou Ndiaye).
 *
 * Usage: bun run scripts/seed-jobs.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import mongoose from "mongoose";
import JobModel from "../src/lib/models/Job";

const FARM_OWNER_EMAIL = "fatou.ndiaye@example.com";

const JOBS = [
  {
    title: "Ouvrier Agricole",
    farmName: "Ferme Bio Thiès",
    location: "Thiès",
    region: "Thiès",
    department: "Thiès",
    contractType: "CDI" as const,
    salaryRange: "150 000 - 200 000 FCFA/mois",
    description:
      "Nous recherchons un ouvrier agricole motivé pour rejoindre notre équipe. Travaux de culture, entretien des parcelles et récolte.",
    requirements: [
      "Expérience en agriculture de 2 ans minimum",
      "Connaissance des techniques de maraîchage",
      "Capacité à travailler en équipe",
      "Disponibilité immédiate",
    ],
    status: "active" as const,
  },
  {
    title: "Technicien Horticole",
    farmName: "Jardins de Niayes",
    location: "Dakar",
    region: "Dakar",
    department: "Rufisque",
    contractType: "CDD" as const,
    salaryRange: "250 000 - 350 000 FCFA/mois",
    description:
      "Recherche technicien horticole pour la gestion d'une exploitation de légumes. Supervision des activités et suivi technique.",
    requirements: [
      "Diplôme en horticulture ou agronomie",
      "3 ans d'expérience minimum",
      "Maîtrise des techniques de production sous serre",
      "Permis de conduire souhaité",
    ],
    status: "active" as const,
  },
  {
    title: "Chef de Culture Maraîchère",
    farmName: "Coopérative Agricole de Mbour",
    location: "Mbour",
    region: "Thiès",
    department: "Mbour",
    contractType: "CDI" as const,
    salaryRange: "400 000 - 500 000 FCFA/mois",
    description:
      "Coopérative agricole recherche un chef de culture expérimenté pour coordonner la production maraîchère sur 5 hectares avec une équipe de 10 personnes.",
    requirements: [
      "Formation supérieure en agronomie",
      "5 ans d'expérience en gestion de culture",
      "Compétences en gestion d'équipe",
      "Connaissance des marchés locaux",
      "Maîtrise de l'irrigation goutte-à-goutte",
    ],
    status: "active" as const,
  },
  {
    title: "Ouvrier Saisonnier - Récolte",
    farmName: "Exploitation Fruitière Casamance",
    location: "Ziguinchor",
    region: "Ziguinchor",
    department: "Ziguinchor",
    contractType: "Saisonnier" as const,
    salaryRange: "120 000 FCFA/mois",
    description:
      "Recrutement d'ouvriers saisonniers pour la récolte des mangues et agrumes. Contrat de 3 mois renouvelable.",
    requirements: [
      "Aucune expérience requise",
      "Bonne condition physique",
      "Capacité à travailler en extérieur",
      "Disponibilité de mars à mai",
    ],
    status: "active" as const,
  },
  {
    title: "Conducteur de Tracteur",
    farmName: "Agrobusiness Kaolack",
    location: "Kaolack",
    region: "Kaolack",
    department: "Kaolack",
    contractType: "CDI" as const,
    salaryRange: "280 000 - 320 000 FCFA/mois",
    description:
      "Entreprise agricole moderne recherche conducteur de tracteur qualifié pour la préparation des sols et travaux mécanisés sur 50 hectares.",
    requirements: [
      "Permis poids lourd obligatoire",
      "5 ans d'expérience minimum",
      "Connaissance des engins agricoles",
      "Capacité d'entretien mécanique de base",
    ],
    status: "active" as const,
  },
  {
    title: "Stage en Production Avicole",
    farmName: "Aviculture du Sahel",
    location: "Saint-Louis",
    region: "Saint-Louis",
    department: "Saint-Louis",
    contractType: "Stage" as const,
    salaryRange: "75 000 FCFA/mois",
    description:
      "Stage de 6 mois en production avicole. Accompagnement complet sur la chaîne de production.",
    requirements: [
      "Étudiant en agronomie ou zootechnie",
      "Niveau BTS minimum",
      "Motivation et curiosité",
    ],
    status: "active" as const,
  },
  {
    title: "Responsable Élevage Bovin",
    farmName: "Ranch de Dahra",
    location: "Dahra",
    region: "Louga",
    department: "Linguère",
    contractType: "CDI" as const,
    salaryRange: "350 000 - 450 000 FCFA/mois",
    description:
      "Pilotage d'un troupeau de 200 bovins. Gestion alimentation, santé et reproduction.",
    requirements: [
      "Vétérinaire ou zootechnicien",
      "Expérience en gestion de troupeau",
      "Maîtrise de l'élevage extensif",
    ],
    status: "active" as const,
  },
  {
    title: "Vendeur Boutique Agricole",
    farmName: "AGS Globalfarm SARL",
    location: "Dakar",
    region: "Dakar",
    department: "Dakar",
    contractType: "CDD" as const,
    salaryRange: "180 000 - 220 000 FCFA/mois",
    description:
      "Conseil et vente d'intrants agricoles (engrais, semences, phyto) en magasin et auprès des clients producteurs.",
    requirements: [
      "Bac+2 en commerce ou agronomie",
      "Bonne connaissance des intrants agricoles",
      "Aisance relationnelle",
    ],
    status: "active" as const,
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

  // Find seeded farm_owner
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
  const ownerId = String(farmOwner.id ?? farmOwner._id);
  console.log(`Using farm_owner id: ${ownerId}`);

  let created = 0;
  let updated = 0;
  for (const job of JOBS) {
    const existing = await JobModel.findOne({
      title: job.title,
      farmName: job.farmName,
    });
    if (existing) {
      await JobModel.updateOne(
        { _id: existing._id },
        { $set: { ...job, createdBy: ownerId } },
      );
      updated += 1;
      console.log(`- Updated ${job.title} (${job.farmName})`);
    } else {
      await JobModel.create({
        ...job,
        createdBy: ownerId,
        applicantsCount: 0,
        postedDate: new Date(),
      });
      created += 1;
      console.log(`✓ Created ${job.title} (${job.farmName})`);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
