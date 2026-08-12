import { NextResponse } from "next/server";

const CATEGORIES = [
  { key: "engrais", label: "Engrais" },
  { key: "phyto", label: "Phyto" },
  { key: "semence", label: "Semence" },
  { key: "petit_materiel", label: "Petit materiel" },
];

export async function GET() {
  return NextResponse.json({ categories: CATEGORIES });
}
