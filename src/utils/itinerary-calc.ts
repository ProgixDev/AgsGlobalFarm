import { getTechnicalItineraryById } from "@/data/itineraries";

interface CalculateItineraryParams {
  cropId: string;
  areaM2: number;
  method: ItineraryMethod;
}

function resolveProgram(
  definition: CropItineraryDefinition,
  method: ItineraryMethod,
): ItineraryProgramDefinition {
  return definition.methodPrograms?.[method] ?? definition.defaultProgram;
}

export function calculateScaledItinerary({
  cropId,
  areaM2,
  method,
}: CalculateItineraryParams): ScaledCropItinerary {
  const definition = getTechnicalItineraryById(cropId);

  if (!definition) {
    throw new Error(`Aucun itineraire trouve pour la culture: ${cropId}`);
  }

  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    throw new Error("La superficie doit etre un nombre strictement positif.");
  }

  if (!definition.supportedMethods.includes(method)) {
    throw new Error(
      `Le mode ${method} n'est pas pris en charge pour ${definition.cropName}.`,
    );
  }

  const scaleFactor = areaM2 / definition.baselineAreaM2;
  const selectedProgram = resolveProgram(definition, method);

  return {
    id: definition.id,
    cropName: definition.cropName,
    areaM2,
    method,
    scaleFactor,
    baselineAreaM2: definition.baselineAreaM2,
    sourcePdf: definition.sourcePdf,
    program: {
      scheduleType: selectedProgram.scheduleType,
      notes: selectedProgram.notes,
      phyto: selectedProgram.phyto,
      fertilization: selectedProgram.fertilization.map((step) => ({
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

export function getMethodLabel(method: ItineraryMethod) {
  return method === "serre" ? "Serre" : "Plein champ";
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
      return "Periode";
  }
}

export function formatDoseValue(value: number) {
  return Number.isInteger(value) ? `${value}` : `${value}`;
}
