/**
 * Seeds shop products to MongoDB.
 * Idempotent: upserts by `id` slug.
 *
 * Usage: bun run scripts/seed-products.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import mongoose from "mongoose";
import ProductModel from "../src/lib/models/Product";

const SHOP_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80";

const PRODUCTS = [
  {
    id: "engrais-npk-151515",
    name: "Engrais NPK 15-15-15",
    category: "engrais",
    priceTTC: 12500,
    unit: "sac 50 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80",
    shortDescription:
      "Engrais equilibre pour cultures maraicheres et cereales.",
    longDescription:
      "Formule NPK polyvalente pour stimuler la croissance vegetative, la floraison et le rendement. Convient a la plupart des sols agricoles avec un programme d'apport regulier.",
    isInStock: true,
    stockQty: 42,
    brand: "AGS Agro",
    origin: "Senegal",
    usage: "Epandage en fond et en couverture selon culture.",
    safety: "Porter gants et masque. Eviter contact avec les yeux.",
    dosage: "200 a 350 kg/ha selon analyse de sol.",
  },
  {
    id: "engrais-uree-46",
    name: "Uree 46%",
    category: "engrais",
    priceTTC: 11800,
    unit: "sac 50 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Apport azote rapide pour relancer la croissance.",
    longDescription:
      "Engrais azote a liberte rapide recommande en phase de developpement vegetatif. Ideal pour renforcer la vigueur des plants en debut de cycle.",
    isInStock: true,
    stockQty: 30,
    brand: "Sahel Fert",
    origin: "Maroc",
    usage: "Appliquer sur sol humide puis arroser legerement.",
    safety: "Conserver au sec, hors de portee des enfants.",
    dosage: "100 a 200 kg/ha en fractionne.",
  },
  {
    id: "engrais-compost-premium",
    name: "Compost organique premium",
    category: "engrais",
    priceTTC: 7200,
    unit: "sac 25 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1592982871875-5f5e7cb8f7eb?auto=format&fit=crop&w=800&q=80",
    shortDescription:
      "Amendement organique pour ameliorer la structure du sol.",
    longDescription:
      "Compost tamise riche en matiere organique, favorise la retention d'eau et l'activite biologique du sol. Recommande pour maraichage et arboriculture.",
    isInStock: true,
    stockQty: 18,
    brand: "Teranga Bio",
    origin: "Thiès",
    usage: "Incorporer au sol avant repiquage ou semis.",
    safety: "Stocker dans un endroit ventile.",
    dosage: "1 a 3 kg/m2 selon fertilite.",
  },
  {
    id: "engrais-kcl-60",
    name: "Chlorure de potassium KCl 60%",
    category: "engrais",
    priceTTC: 10900,
    unit: "sac 50 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1598514982849-2f22f8f4df59?auto=format&fit=crop&w=800&q=80",
    shortDescription:
      "Renforce la qualite des fruits et la resistance au stress.",
    longDescription:
      "Fertilisation potassique concentree pour soutenir la fructification, la tenue des fruits et la tolerance a la secheresse.",
    isInStock: false,
    stockQty: 0,
    brand: "AgriPlus",
    origin: "Mbour",
    usage: "Associer avec fertilisation azotee et phosphatee.",
    safety: "Ne pas surdoser sur cultures sensibles au chlore.",
    dosage: "80 a 150 kg/ha selon culture.",
  },
  {
    id: "phyto-fongicide-cuivre",
    name: "Fongicide cuivre 50 WP",
    category: "phyto",
    priceTTC: 6800,
    unit: "boite 1 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Protection preventive contre mildiou et bacterioses.",
    longDescription:
      "Fongicide de contact a base de cuivre pour prevenir les maladies foliaires sur tomate, pomme de terre et cultures maraicheres.",
    isInStock: true,
    stockQty: 24,
    brand: "PhytoSahel",
    origin: "Dakar",
    usage: "Pulveriser sur feuillage sec en preventive.",
    safety: "Port EPI obligatoire pendant la preparation.",
    dosage: "2 a 3 g/L d'eau.",
  },
  {
    id: "phyto-insecticide-neem",
    name: "Insecticide neem concentre",
    category: "phyto",
    priceTTC: 5400,
    unit: "flacon 500 ml",
    imageUrl:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Controle biologique des ravageurs suceurs et piqueurs.",
    longDescription:
      "Solution a base d'extrait de neem, agit sur aleurodes, pucerons et thrips. Compatible avec programmes de production raisonnée.",
    isInStock: true,
    stockQty: 33,
    brand: "BioProtect",
    origin: "Kaolack",
    usage: "Pulveriser en fin de journee pour meilleure efficacite.",
    safety: "Eviter contact direct avec peau et yeux.",
    dosage: "3 a 5 ml/L d'eau.",
  },
  {
    id: "phyto-herbicide-selectif",
    name: "Herbicide selectif graminees",
    category: "phyto",
    priceTTC: 8900,
    unit: "bidon 1 L",
    imageUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Elimine les graminees sans nuire aux cultures cibles.",
    longDescription:
      "Herbicide post-levee pour maitriser les adventices graminees. Application precise recommandee pour optimiser la selectivite.",
    isInStock: true,
    stockQty: 11,
    brand: "Green Shield",
    origin: "Saint-Louis",
    usage: "Appliquer sur adventices jeunes et en croissance active.",
    safety: "Ne pas pulveriser par vent fort.",
    dosage: "1 a 1,5 L/ha.",
  },
  {
    id: "phyto-acaricide-pro",
    name: "Acaricide pro",
    category: "phyto",
    priceTTC: 7600,
    unit: "flacon 250 ml",
    imageUrl:
      "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=800&q=80",
    shortDescription:
      "Controle les attaques d'acariens en serre et plein champ.",
    longDescription:
      "Formulation concentree pour limiter rapidement les populations d'acariens sur cultures legumieres et fruitieres.",
    isInStock: false,
    stockQty: 0,
    brand: "AgriCare",
    origin: "Louga",
    usage: "Alterner avec autres familles pour eviter resistances.",
    safety: "Respecter delai avant recolte.",
    dosage: "0,5 a 0,8 ml/L d'eau.",
  },
  {
    id: "semence-mais-hybride",
    name: "Semence mais hybride precoce",
    category: "semence",
    priceTTC: 9800,
    unit: "sachet 5 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1601599561213-832382fd07ba?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Cycle court adapte aux zones a pluviometrie variable.",
    longDescription:
      "Variete hybride a bon potentiel de rendement, bonne tolerance au stress hydrique et adaptation aux conditions soudano-sahéliennes.",
    isInStock: true,
    stockQty: 27,
    brand: "Semences du Sahel",
    origin: "Tambacounda",
    usage: "Semer en lignes regulieres apres bonne humidification du sol.",
    safety: "Conserver sachet ferme a l'abri de l'humidite.",
    dosage: "20 a 25 kg/ha.",
  },
  {
    id: "semence-riz-irrigue",
    name: "Semence riz irrigue",
    category: "semence",
    priceTTC: 8600,
    unit: "sac 20 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Variete performante pour perimetres irrigues.",
    longDescription:
      "Semence certifiee pour riziculture irriguee, bon tallage et regularite de maturation pour faciliter la recolte.",
    isInStock: true,
    stockQty: 21,
    brand: "Delta Seeds",
    origin: "Vallée du fleuve",
    usage: "Pre-germer avant repiquage ou semis direct selon systeme.",
    safety: "Ne pas melanger avec produits non homologues.",
    dosage: "60 a 80 kg/ha.",
  },
  {
    id: "semence-oignon-violet",
    name: "Semence oignon violet",
    category: "semence",
    priceTTC: 4200,
    unit: "sachet 100 g",
    imageUrl:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Bonne conservation post-recolte et calibre regulier.",
    longDescription:
      "Semence maraichere pour oignon violet, appreciee pour sa conservation et son adaptation aux bassins de production locaux.",
    isInStock: true,
    stockQty: 50,
    brand: "Ndiaye Seeds",
    origin: "Sangalkam",
    usage: "Semis en pepiniere puis repiquage au stade 3-4 feuilles.",
    safety: "Conserver au frais et au sec.",
    dosage: "3 a 4 kg/ha en production.",
  },
  {
    id: "semence-arachide-coque-rouge",
    name: "Semence arachide coque rouge",
    category: "semence",
    priceTTC: 6900,
    unit: "sac 25 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Variete locale appreciee pour rendement stable.",
    longDescription:
      "Semence d'arachide selectionnee pour bonne adaptation aux zones arachidieres et qualite de gousses.",
    isInStock: false,
    stockQty: 0,
    brand: "Bassin Arachidier",
    origin: "Kaolack",
    usage: "Semis en debut de saison des pluies sur sol bien prepare.",
    safety: "Eviter stockage en milieu humide.",
    dosage: "80 a 100 kg/ha.",
  },
  {
    id: "materiel-pulverisateur-16l",
    name: "Pulverisateur dorsal 16L",
    category: "petit_materiel",
    priceTTC: 14500,
    unit: "piece",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    shortDescription:
      "Pulverisateur manuel robuste pour traitements foliaires.",
    longDescription:
      "Equipement ergonomique avec lance reglable, ideal pour applications phytosanitaires sur petites et moyennes exploitations.",
    isInStock: true,
    stockQty: 14,
    brand: "AgriTools",
    origin: "Dakar",
    usage: "Nettoyer apres chaque application.",
    safety: "Utiliser uniquement avec EPI adequat.",
    dosage: "N/A",
  },
  {
    id: "materiel-arrosoir-10l",
    name: "Arrosoir galvanise 10L",
    category: "petit_materiel",
    priceTTC: 5200,
    unit: "piece",
    imageUrl:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Arrosage manuel precis pour pepiniere et planches.",
    longDescription:
      "Arrosoir metallique resistant a la corrosion, pomme d'arrosage fine pour limiter l'erosion des semis.",
    isInStock: true,
    stockQty: 37,
    brand: "Teranga Tools",
    origin: "Rufisque",
    usage: "Ideal pour semis et jeunes plants.",
    safety: "Rincer et secher apres utilisation.",
    dosage: "N/A",
  },
  {
    id: "materiel-secoueur-recolte",
    name: "Secoueur manuel de recolte",
    category: "petit_materiel",
    priceTTC: 9100,
    unit: "piece",
    imageUrl:
      "https://images.unsplash.com/photo-1518991791750-749b69e9f2bb?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Facilite recolte sur cultures fruitieres artisanales.",
    longDescription:
      "Outil leger pour accelerer la recolte et reduire la fatigue operateur sur petites exploitations.",
    isInStock: true,
    stockQty: 9,
    brand: "Harvest Pro",
    origin: "Diourbel",
    usage: "Utiliser sur branches adaptees pour eviter blessures aux plants.",
    safety: "Port de gants recommande.",
    dosage: "N/A",
  },
  {
    id: "materiel-tuyau-irrigation-kit",
    name: "Kit tuyau irrigation goutte a goutte",
    category: "petit_materiel",
    priceTTC: 16500,
    unit: "kit",
    imageUrl: SHOP_PLACEHOLDER_IMAGE,
    shortDescription: "Kit de base pour demarrer micro-irrigation.",
    longDescription:
      "Solution simple pour optimiser l'arrosage et reduire les pertes d'eau en maraichage.",
    isInStock: false,
    stockQty: 0,
    brand: "EcoIrrig",
    origin: "Saint-Louis",
    usage: "Installer sur parcelle nivelee avec filtration amont.",
    safety: "Verifier pression avant mise en service.",
    dosage: "N/A",
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

  for (const product of PRODUCTS) {
    const existing = await ProductModel.findOne({ id: product.id });
    await ProductModel.findOneAndUpdate(
      { id: product.id },
      { $set: product },
      { upsert: true, new: true },
    );
    if (existing) {
      updated += 1;
      console.log(`- Updated ${product.id}`);
    } else {
      created += 1;
      console.log(`✓ Created ${product.id}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
