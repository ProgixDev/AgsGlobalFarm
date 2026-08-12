/**
 * Seeds online formations.
 * Idempotent: upserts by `title`.
 *
 * Usage: bun run scripts/seed-formations-online.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import mongoose from "mongoose";
import OnlineFormationModel from "../src/lib/models/OnlineFormation";

const FORMATIONS = [
  {
    title: "Culture sous serre - Techniques modernes",
    description:
      "Apprenez les techniques modernes de culture sous serre adaptées au climat sénégalais. Maîtrisez la gestion du climat, l'irrigation et les pratiques de production.",
    image:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80",
    duration: "8h",
    level: "intermédiaire",
    price: 25000,
    category: "Production",
    type: "online",
    icon: "leaf-outline",
    sections: [
      {
        id: 1,
        title: "Introduction aux serres agricoles",
        lessons: [
          {
            id: 1,
            title: "Types de serres et structures",
            content:
              "# Types de Serres\n\nIl existe plusieurs types de serres adaptées au climat sénégalais :\n\n## Serre Tunnel\nLa serre tunnel est la plus courante et économique. Convient au climat chaud.\n\n## Serre Chapelle\nPlus grande et robuste, idéale pour exploitations moyennes.\n\n## Serre Multi-Chapelle\nPour les grandes exploitations commerciales.",
          },
          {
            id: 2,
            title: "Gestion du climat",
            content:
              "Apprenez à contrôler température, humidité et ventilation. Les capteurs et systèmes automatiques permettent une gestion optimale.",
          },
        ],
      },
      {
        id: 2,
        title: "Production maraîchère sous serre",
        lessons: [
          {
            id: 1,
            title: "Choix des cultures",
            content:
              "Tomates, poivrons, concombres et salades sont les cultures les plus rentables sous serre au Sénégal.",
          },
          {
            id: 2,
            title: "Irrigation goutte-à-goutte",
            content:
              "Le goutte-à-goutte économise jusqu'à 40% d'eau. Installation, entretien et programmation.",
          },
          {
            id: 3,
            title: "Lutte intégrée contre les ravageurs",
            content:
              "Méthodes biologiques, chimiques et culturales pour protéger les cultures.",
          },
        ],
      },
    ],
    quiz: {
      sections: [
        {
          id: 1,
          title: "Évaluation finale",
          questions: [
            {
              id: 1,
              question: "Quel type de serre est le plus économique ?",
              points: 1,
              options: [
                { id: "a", text: "Serre Tunnel" },
                { id: "b", text: "Serre Chapelle" },
                { id: "c", text: "Serre Multi-Chapelle" },
                { id: "d", text: "Serre Verre" },
              ],
              correctAnswer: "a",
            },
            {
              id: 2,
              question: "Le goutte-à-goutte économise jusqu'à combien d'eau ?",
              points: 1,
              options: [
                { id: "a", text: "10%" },
                { id: "b", text: "20%" },
                { id: "c", text: "40%" },
                { id: "d", text: "60%" },
              ],
              correctAnswer: "c",
            },
            {
              id: 3,
              question:
                "Quelle culture est rentable sous serre au Sénégal ?",
              points: 1,
              options: [
                { id: "a", text: "Tomate" },
                { id: "b", text: "Mil" },
                { id: "c", text: "Arachide" },
                { id: "d", text: "Coton" },
              ],
              correctAnswer: "a",
            },
          ],
        },
      ],
    },
    owners: [],
  },
  {
    title: "Élevage avicole - Démarrage et gestion",
    description:
      "Formation complète pour démarrer un élevage avicole rentable. Couvre l'installation, l'alimentation, la santé et la commercialisation.",
    image:
      "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
    duration: "6h",
    level: "débutant",
    price: 18000,
    category: "Élevage",
    type: "online",
    icon: "egg-outline",
    sections: [
      {
        id: 1,
        title: "Installation du poulailler",
        lessons: [
          {
            id: 1,
            title: "Choix du site et construction",
            content:
              "Critères de choix : drainage, orientation, éloignement des habitations.",
          },
          {
            id: 2,
            title: "Équipements essentiels",
            content:
              "Mangeoires, abreuvoirs, perchoirs, pondoirs, ventilation.",
          },
        ],
      },
      {
        id: 2,
        title: "Alimentation et santé",
        lessons: [
          {
            id: 1,
            title: "Programmes alimentaires",
            content:
              "Démarrage, croissance, ponte. Composition des rations selon l'âge.",
          },
          {
            id: 2,
            title: "Prévention sanitaire",
            content:
              "Vaccination, biosécurité, gestion des maladies courantes.",
          },
        ],
      },
    ],
    quiz: {
      sections: [
        {
          id: 1,
          title: "Évaluation",
          questions: [
            {
              id: 1,
              question: "Quel critère est important pour le choix du site ?",
              points: 1,
              options: [
                { id: "a", text: "Drainage" },
                { id: "b", text: "Couleur du sol" },
                { id: "c", text: "Présence d'arbres" },
                { id: "d", text: "Altitude élevée" },
              ],
              correctAnswer: "a",
            },
            {
              id: 2,
              question: "À quel âge changer le programme alimentaire ?",
              points: 1,
              options: [
                { id: "a", text: "Selon le stade physiologique" },
                { id: "b", text: "Tous les jours" },
                { id: "c", text: "Une fois par mois" },
                { id: "d", text: "Jamais" },
              ],
              correctAnswer: "a",
            },
          ],
        },
      ],
    },
    owners: [],
  },
  {
    title: "Maraîchage biologique",
    description:
      "Produire bio sans intrants chimiques. Compostage, lutte biologique, certification et commercialisation.",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    duration: "10h",
    level: "intermédiaire",
    price: 30000,
    category: "Production",
    type: "online",
    icon: "leaf-outline",
    sections: [
      {
        id: 1,
        title: "Principes du bio",
        lessons: [
          {
            id: 1,
            title: "Cahier des charges agriculture biologique",
            content:
              "Réglementation, intrants autorisés, traçabilité.",
          },
          {
            id: 2,
            title: "Préparation du sol",
            content:
              "Rotation, jachère, amendements organiques.",
          },
        ],
      },
      {
        id: 2,
        title: "Compostage et fertilisation",
        lessons: [
          {
            id: 1,
            title: "Fabrication du compost",
            content: "Matières, ratios, retournement, maturation.",
          },
          {
            id: 2,
            title: "Engrais verts",
            content: "Légumineuses, mucuna, crotalaire.",
          },
        ],
      },
    ],
    quiz: {
      sections: [
        {
          id: 1,
          title: "Quiz Bio",
          questions: [
            {
              id: 1,
              question: "Quel intrant est autorisé en bio ?",
              points: 1,
              options: [
                { id: "a", text: "Compost" },
                { id: "b", text: "Engrais chimique NPK" },
                { id: "c", text: "Pesticide synthétique" },
                { id: "d", text: "Herbicide" },
              ],
              correctAnswer: "a",
            },
            {
              id: 2,
              question: "À quoi sert un engrais vert ?",
              points: 1,
              options: [
                { id: "a", text: "Enrichir le sol en azote" },
                { id: "b", text: "Colorier les feuilles" },
                { id: "c", text: "Eliminer les insectes" },
                { id: "d", text: "Aucun usage" },
              ],
              correctAnswer: "a",
            },
          ],
        },
      ],
    },
    owners: [],
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
    const existing = await OnlineFormationModel.findOne({
      title: formation.title,
    });
    if (existing) {
      await OnlineFormationModel.updateOne(
        { _id: existing._id },
        { $set: formation },
      );
      updated += 1;
      console.log(`- Updated ${formation.title}`);
    } else {
      await OnlineFormationModel.create(formation);
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
