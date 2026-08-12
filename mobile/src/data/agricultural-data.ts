// Agricultural data for Senegal - Departments, Soil Types, Crops, Production Types

export interface Department {
  id: string;
  name: string;
  regionId: string;
  municipalities: string[];
}

export interface SoilType {
  id: string;
  name: string;
  description: string;
}

export interface ProductionType {
  id: string;
  name: string;
  category: string;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  season?: string;
}

// Departments by Region
export const departments: Department[] = [
  // Dakar Region
  {
    id: "dakar-dept",
    name: "Dakar",
    regionId: "dakar",
    municipalities: ["Dakar", "Pikine", "Guédiawaye", "Rufisque"],
  },

  // Thiès Region
  {
    id: "thies-dept",
    name: "Thiès",
    regionId: "thies",
    municipalities: ["Thiès", "Pout", "Khombole"],
  },
  {
    id: "mbour-dept",
    name: "Mbour",
    regionId: "thies",
    municipalities: ["Mbour", "Joal-Fadiouth", "Nguékhokh"],
  },
  {
    id: "tivaouane-dept",
    name: "Tivaouane",
    regionId: "thies",
    municipalities: ["Tivaouane", "Mékhé", "Pambal"],
  },

  // Diourbel Region
  {
    id: "diourbel-dept",
    name: "Diourbel",
    regionId: "diourbel",
    municipalities: ["Diourbel", "Ndoulo", "Tocky Gare"],
  },
  {
    id: "bambey-dept",
    name: "Bambey",
    regionId: "diourbel",
    municipalities: ["Bambey", "Lambaye", "Baba Garage"],
  },
  {
    id: "mbacke-dept",
    name: "Mbacké",
    regionId: "diourbel",
    municipalities: ["Touba", "Mbacké", "Darou Salam"],
  },

  // Fatick Region
  {
    id: "fatick-dept",
    name: "Fatick",
    regionId: "fatick",
    municipalities: ["Fatick", "Dioffior", "Niakhar"],
  },
  {
    id: "foundiougne-dept",
    name: "Foundiougne",
    regionId: "fatick",
    municipalities: ["Foundiougne", "Toubacouta", "Djilor"],
  },
  {
    id: "gossas-dept",
    name: "Gossas",
    regionId: "fatick",
    municipalities: ["Gossas", "Colobane", "Ouadiour"],
  },

  // Kaolack Region
  {
    id: "kaolack-dept",
    name: "Kaolack",
    regionId: "kaolack",
    municipalities: ["Kaolack", "Latmingué", "Ndoffane"],
  },
  {
    id: "guinguineo-dept",
    name: "Guinguinéo",
    regionId: "kaolack",
    municipalities: ["Guinguinéo", "Keur Socé", "Mbadakhoune"],
  },
  {
    id: "nioro-dept",
    name: "Nioro du Rip",
    regionId: "kaolack",
    municipalities: ["Nioro du Rip", "Médina Sabakh", "Keur Madiabel"],
  },

  // Kaffrine Region
  {
    id: "kaffrine-dept",
    name: "Kaffrine",
    regionId: "kaffrine",
    municipalities: ["Kaffrine", "Ngoye", "Kathiotte"],
  },
  {
    id: "birkilane-dept",
    name: "Birkilane",
    regionId: "kaffrine",
    municipalities: ["Birkilane", "Mabo", "Diamal"],
  },
  {
    id: "koungheul-dept",
    name: "Koungheul",
    regionId: "kaffrine",
    municipalities: ["Koungheul", "Lour Escale", "Ida Mouride"],
  },
  {
    id: "malem-hodar-dept",
    name: "Malem-Hodar",
    regionId: "kaffrine",
    municipalities: ["Malem-Hodar", "Kahi", "Ndiago"],
  },

  // Louga Region
  {
    id: "louga-dept",
    name: "Louga",
    regionId: "louga",
    municipalities: ["Louga", "Keur Momar Sarr", "Léona"],
  },
  {
    id: "linguere-dept",
    name: "Linguère",
    regionId: "louga",
    municipalities: ["Linguère", "Dahra", "Yang Yang"],
  },
  {
    id: "kebemer-dept",
    name: "Kébémer",
    regionId: "louga",
    municipalities: ["Kébémer", "Darou Mousty", "Ndande"],
  },

  // Matam Region
  {
    id: "matam-dept",
    name: "Matam",
    regionId: "matam",
    municipalities: ["Matam", "Ourossogui", "Thilogne"],
  },
  {
    id: "kanel-dept",
    name: "Kanel",
    regionId: "matam",
    municipalities: ["Kanel", "Ndioum", "Wouro Sidy"],
  },
  {
    id: "ranerou-dept",
    name: "Ranérou Ferlo",
    regionId: "matam",
    municipalities: ["Ranérou", "Vélingara", "Oudalaye"],
  },

  // Saint-Louis Region
  {
    id: "saint-louis-dept",
    name: "Saint-Louis",
    regionId: "saint-louis",
    municipalities: ["Saint-Louis", "Gandon", "Mpal"],
  },
  {
    id: "dagana-dept",
    name: "Dagana",
    regionId: "saint-louis",
    municipalities: ["Dagana", "Richard-Toll", "Rosso"],
  },
  {
    id: "podor-dept",
    name: "Podor",
    regionId: "saint-louis",
    municipalities: ["Podor", "Ndioum", "Galoya"],
  },

  // Tambacounda Region
  {
    id: "tambacounda-dept",
    name: "Tambacounda",
    regionId: "tambacounda",
    municipalities: ["Tambacounda", "Koussanar", "Makacoulibantang"],
  },
  {
    id: "bakel-dept",
    name: "Bakel",
    regionId: "tambacounda",
    municipalities: ["Bakel", "Goudiry", "Kidira"],
  },
  {
    id: "goudiry-dept",
    name: "Goudiry",
    regionId: "tambacounda",
    municipalities: ["Goudiry", "Dianké Makhan", "Kouthiaba"],
  },

  // Kédougou Region
  {
    id: "kedougou-dept",
    name: "Kédougou",
    regionId: "kedougou",
    municipalities: ["Kédougou", "Bandafassi", "Fongolimbi"],
  },
  {
    id: "salemata-dept",
    name: "Salémata",
    regionId: "kedougou",
    municipalities: ["Salémata", "Ethiolo", "Oubadji"],
  },
  {
    id: "saraya-dept",
    name: "Saraya",
    regionId: "kedougou",
    municipalities: ["Saraya", "Bembou", "Khossanto"],
  },

  // Kolda Region
  {
    id: "kolda-dept",
    name: "Kolda",
    regionId: "kolda",
    municipalities: ["Kolda", "Saré Coly Sallé", "Médina Chérif"],
  },
  {
    id: "velingara-dept",
    name: "Vélingara",
    regionId: "kolda",
    municipalities: ["Vélingara", "Kounkané", "Paroumba"],
  },
  {
    id: "medina-yoro-foulah-dept",
    name: "Médina Yoro Foulah",
    regionId: "kolda",
    municipalities: ["Médina Yoro Foulah", "Fafacourou", "Pata"],
  },

  // Sédhiou Region
  {
    id: "sedhiou-dept",
    name: "Sédhiou",
    regionId: "sedhiou",
    municipalities: ["Sédhiou", "Diendé", "Marsassoum"],
  },
  {
    id: "bounkiling-dept",
    name: "Bounkiling",
    regionId: "sedhiou",
    municipalities: ["Bounkiling", "Diaroumé", "Tankon"],
  },
  {
    id: "goudomp-dept",
    name: "Goudomp",
    regionId: "sedhiou",
    municipalities: ["Goudomp", "Karantaba", "Samine"],
  },

  // Ziguinchor Region
  {
    id: "ziguinchor-dept",
    name: "Ziguinchor",
    regionId: "ziguinchor",
    municipalities: ["Ziguinchor", "Niaguis", "Boutoupa"],
  },
  {
    id: "bignona-dept",
    name: "Bignona",
    regionId: "ziguinchor",
    municipalities: ["Bignona", "Diouloulou", "Sindian"],
  },
  {
    id: "oussouye-dept",
    name: "Oussouye",
    regionId: "ziguinchor",
    municipalities: ["Oussouye", "Mlomp", "Diembéring"],
  },
];

// Soil Types
export const soilTypes: SoilType[] = [
  {
    id: "sandy",
    name: "Sableux",
    description: "Sol léger, bonne aération, drainage rapide",
  },
  {
    id: "loamy",
    name: "Limoneux",
    description: "Sol équilibré, fertile, bon drainage et rétention d'eau",
  },
  {
    id: "clay",
    name: "Argileux",
    description: "Sol lourd, riche en nutriments, retient l'eau",
  },
];

// Production Types / Farm Itineraries
export const productionTypes: ProductionType[] = [
  { id: "market-garden", name: "Maraîchage", category: "Horticulture" },
  { id: "cereal", name: "Céréaliculture", category: "Cultures vivrières" },
  { id: "livestock-cattle", name: "Élevage bovin", category: "Élevage" },
  { id: "livestock-poultry", name: "Aviculture", category: "Élevage" },
  { id: "livestock-small", name: "Élevage ovin/caprin", category: "Élevage" },
  {
    id: "fruit-trees",
    name: "Arboriculture fruitière",
    category: "Arboriculture",
  },
  { id: "groundnut", name: "Arachide", category: "Cultures de rente" },
  { id: "cotton", name: "Coton", category: "Cultures de rente" },
  { id: "rice", name: "Riziculture", category: "Cultures vivrières" },
  {
    id: "mixed-farming",
    name: "Polyculture-élevage",
    category: "Système mixte",
  },
  { id: "aquaculture", name: "Aquaculture", category: "Pêche" },
  { id: "greenhouse", name: "Culture sous serre", category: "Horticulture" },
];

// Crop Types
export const crops: Crop[] = [
  // Vegetables (Légumes)
  { id: "tomato", name: "Tomate", category: "Légumes", season: "Saison sèche" },
  { id: "onion", name: "Oignon", category: "Légumes", season: "Saison sèche" },
  {
    id: "potato",
    name: "Pomme de terre",
    category: "Légumes",
    season: "Saison sèche",
  },
  { id: "cabbage", name: "Chou", category: "Légumes", season: "Saison sèche" },
  {
    id: "carrot",
    name: "Carotte",
    category: "Légumes",
    season: "Saison sèche",
  },
  {
    id: "lettuce",
    name: "Salade",
    category: "Légumes",
    season: "Saison sèche",
  },
  {
    id: "eggplant",
    name: "Aubergine",
    category: "Légumes",
    season: "Toute saison",
  },
  { id: "pepper", name: "Piment", category: "Légumes", season: "Toute saison" },
  {
    id: "sweet-pepper",
    name: "Poivron",
    category: "Légumes",
    season: "Toute saison",
  },
  { id: "okra", name: "Gombo", category: "Légumes", season: "Hivernage" },
  {
    id: "watermelon",
    name: "Pastèque",
    category: "Légumes",
    season: "Saison sèche",
  },
  { id: "melon", name: "Melon", category: "Légumes", season: "Saison sèche" },

  // Cereals (Céréales)
  { id: "rice", name: "Riz", category: "Céréales", season: "Hivernage" },
  { id: "millet", name: "Mil", category: "Céréales", season: "Hivernage" },
  { id: "sorghum", name: "Sorgho", category: "Céréales", season: "Hivernage" },
  { id: "maize", name: "Maïs", category: "Céréales", season: "Hivernage" },
  { id: "fonio", name: "Fonio", category: "Céréales", season: "Hivernage" },

  // Cash Crops (Cultures de rente)
  {
    id: "groundnut",
    name: "Arachide",
    category: "Oléagineux",
    season: "Hivernage",
  },
  { id: "cotton", name: "Coton", category: "Textile", season: "Hivernage" },
  { id: "sesame", name: "Sésame", category: "Oléagineux", season: "Hivernage" },
  {
    id: "hibiscus",
    name: "Bissap",
    category: "Condiment",
    season: "Hivernage",
  },

  // Fruits (Fruits)
  { id: "mango", name: "Mangue", category: "Fruits", season: "Contre-saison" },
  { id: "orange", name: "Orange", category: "Fruits", season: "Saison sèche" },
  { id: "lemon", name: "Citron", category: "Fruits", season: "Toute saison" },
  { id: "banana", name: "Banane", category: "Fruits", season: "Toute saison" },
  { id: "papaya", name: "Papaye", category: "Fruits", season: "Toute saison" },
  {
    id: "cashew",
    name: "Anacarde",
    category: "Fruits",
    season: "Contre-saison",
  },

  // Legumes (Légumineuses)
  {
    id: "cowpea",
    name: "Niébé",
    category: "Légumineuses",
    season: "Hivernage",
  },
  {
    id: "bean",
    name: "Haricot",
    category: "Légumineuses",
    season: "Saison sèche",
  },

  // Tubers (Tubercules)
  {
    id: "cassava",
    name: "Manioc",
    category: "Tubercules",
    season: "Toute saison",
  },
  {
    id: "sweet-potato",
    name: "Patate douce",
    category: "Tubercules",
    season: "Toute saison",
  },
];

// Helper functions
export const getDepartmentsByRegion = (regionId: string): Department[] => {
  return departments.filter((dept) => dept.regionId === regionId);
};

export const getMunicipalitiesByDepartment = (
  departmentId: string,
): string[] => {
  const dept = departments.find((d) => d.id === departmentId);
  return dept?.municipalities || [];
};

export const getCropsByCategory = (category: string): Crop[] => {
  return crops.filter((crop) => crop.category === category);
};

export const getCropCategories = (): string[] => {
  return Array.from(new Set(crops.map((crop) => crop.category)));
};
