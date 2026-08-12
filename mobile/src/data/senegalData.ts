// Senegalese regions and departments data for location selection

export const senegalRegions = [
  { label: "Dakar", value: "Dakar" },
  { label: "Thiès", value: "Thiès" },
  { label: "Diourbel", value: "Diourbel" },
  { label: "Fatick", value: "Fatick" },
  { label: "Kaolack", value: "Kaolack" },
  { label: "Kaffrine", value: "Kaffrine" },
  { label: "Kolda", value: "Kolda" },
  { label: "Louga", value: "Louga" },
  { label: "Matam", value: "Matam" },
  { label: "Saint-Louis", value: "Saint-Louis" },
  { label: "Sédhiou", value: "Sédhiou" },
  { label: "Tambacounda", value: "Tambacounda" },
  { label: "Kédougou", value: "Kédougou" },
  { label: "Ziguinchor", value: "Ziguinchor" },
];

export const senegalDepartments: Record<
  string,
  { label: string; value: string }[]
> = {
  Dakar: [
    { label: "Dakar", value: "Dakar" },
    { label: "Guédiawaye", value: "Guédiawaye" },
    { label: "Pikine", value: "Pikine" },
    { label: "Rufisque", value: "Rufisque" },
  ],
  Thiès: [
    { label: "Thiès", value: "Thiès" },
    { label: "Mbour", value: "Mbour" },
    { label: "Tivaouane", value: "Tivaouane" },
  ],
  Diourbel: [
    { label: "Diourbel", value: "Diourbel" },
    { label: "Bambey", value: "Bambey" },
    { label: "Mbacké", value: "Mbacké" },
  ],
  Fatick: [
    { label: "Fatick", value: "Fatick" },
    { label: "Foundiougne", value: "Foundiougne" },
    { label: "Gossas", value: "Gossas" },
  ],
  Kaolack: [
    { label: "Kaolack", value: "Kaolack" },
    { label: "Guinguinéo", value: "Guinguinéo" },
    { label: "Nioro du Rip", value: "Nioro du Rip" },
  ],
  Kaffrine: [
    { label: "Kaffrine", value: "Kaffrine" },
    { label: "Birkelane", value: "Birkelane" },
    { label: "Koungheul", value: "Koungheul" },
    { label: "Malem-Hodar", value: "Malem-Hodar" },
  ],
  Kolda: [
    { label: "Kolda", value: "Kolda" },
    { label: "Médina Yoro Foulah", value: "Médina Yoro Foulah" },
    { label: "Vélingara", value: "Vélingara" },
  ],
  Louga: [
    { label: "Louga", value: "Louga" },
    { label: "Kébémer", value: "Kébémer" },
    { label: "Linguère", value: "Linguère" },
  ],
  Matam: [
    { label: "Matam", value: "Matam" },
    { label: "Kanel", value: "Kanel" },
    { label: "Ranérou", value: "Ranérou" },
  ],
  "Saint-Louis": [
    { label: "Saint-Louis", value: "Saint-Louis" },
    { label: "Dagana", value: "Dagana" },
    { label: "Podor", value: "Podor" },
  ],
  Sédhiou: [
    { label: "Sédhiou", value: "Sédhiou" },
    { label: "Bounkiling", value: "Bounkiling" },
    { label: "Goudomp", value: "Goudomp" },
  ],
  Tambacounda: [
    { label: "Tambacounda", value: "Tambacounda" },
    { label: "Bakel", value: "Bakel" },
    { label: "Goudiry", value: "Goudiry" },
    { label: "Koumpentoum", value: "Koumpentoum" },
  ],
  Kédougou: [
    { label: "Kédougou", value: "Kédougou" },
    { label: "Salémata", value: "Salémata" },
    { label: "Saraya", value: "Saraya" },
  ],
  Ziguinchor: [
    { label: "Ziguinchor", value: "Ziguinchor" },
    { label: "Bignona", value: "Bignona" },
    { label: "Oussouye", value: "Oussouye" },
  ],
};

export const contractTypes = [
  { label: "CDI (Contrat à Durée Indéterminée)", value: "CDI" },
  { label: "CDD (Contrat à Durée Déterminée)", value: "CDD" },
  { label: "Saisonnier", value: "Saisonnier" },
  { label: "Stage", value: "Stage" },
];
