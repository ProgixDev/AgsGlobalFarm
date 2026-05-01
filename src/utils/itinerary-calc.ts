import { getTechnicalItineraryById } from "@/data/itineraries";

interface CalculateItineraryParams {
  cropId: string;
  areaM2: number;
}

export function calculateScaledItinerary({
  cropId,
  areaM2,
}: CalculateItineraryParams): ScaledCropItinerary {
  const definition = getTechnicalItineraryById(cropId);

  if (!definition) {
    throw new Error(`Aucun itinéraire trouvé pour la culture : ${cropId}`);
  }

  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    throw new Error("La superficie doit être un nombre strictement positif.");
  }

  const scaleFactor = areaM2 / definition.baselineAreaM2;
  const program = definition.program;

  return {
    id: definition.id,
    cropName: definition.cropName,
    emoji: definition.emoji,
    cultivationNote: definition.cultivationNote,
    areaM2,
    scaleFactor,
    baselineAreaM2: definition.baselineAreaM2,
    sourcePdf: definition.sourcePdf,
    specs: definition.specs,
    program: {
      scheduleType: program.scheduleType,
      notes: program.notes,
      phyto: program.phyto,
      fertilization: program.fertilization.map((step) => ({
        id: step.id,
        label: step.label,
        schedule: step.schedule,
        doses: step.doses.map((dose) => ({
          product: dose.product,
          dose: dose.dose,
          unit: dose.unit,
          scaledDose: dose.dose * scaleFactor,
        })),
      })),
    },
  };
}

export function getScheduleLabel(scheduleType: ItineraryScheduleType) {
  switch (scheduleType) {
    case "weekly":
      return "Semaine";
    case "phase":
      return "Phase";
    case "stage":
      return "Stade";
    default:
      return "Période";
  }
}

export function formatDose(value: number, unit: ItineraryDoseUnit) {
  if (value === 0) return `0 ${unit}`;

  if (unit === "g" && value >= 1000) {
    const kg = value / 1000;
    return `${formatNumber(kg)} kg`;
  }

  if (unit === "ml" && value >= 1000) {
    const l = value / 1000;
    return `${formatNumber(l)} L`;
  }

  return `${formatNumber(value)} ${unit}`;
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "—";

  const rounded = Math.round(value * 100) / 100;

  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString("fr-FR");
  }

  return rounded.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatArea(areaM2: number) {
  return `${formatNumber(areaM2)} m²`;
}
