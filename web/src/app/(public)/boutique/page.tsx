import { getProducts } from "@/lib/db";
import BoutiqueClientPage from "./BoutiqueClientPage";

const categories = [
  { key: "all", label: "Tout" },
  { key: "engrais", label: "Engrais" },
  { key: "phyto", label: "Phyto" },
  { key: "semence", label: "Semence" },
  { key: "petit_materiel", label: "Petit matériel" },
];

export default async function BoutiquePage() {
  const { products } = await getProducts();
  const productsData = JSON.parse(JSON.stringify(products));

  return (
    <BoutiqueClientPage products={productsData} categories={categories} />
  );
}
