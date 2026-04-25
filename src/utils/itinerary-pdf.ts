import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  formatDoseValue,
  getMethodLabel,
  getScheduleLabel,
} from "@/utils/itinerary-calc";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildFertilizationRows(itinerary: ScaledCropItinerary) {
  return itinerary.program.fertilization
    .map((step) => {
      const doses = step.doses
        .map(
          (dose) =>
            `<div class="dose-row"><span>${escapeHtml(dose.product)}</span><strong>${escapeHtml(
              formatDoseValue(dose.scaledDose),
            )} ${dose.unit}</strong></div>`,
        )
        .join("");

      return `
      <section class="card">
        <h3>${escapeHtml(step.label)}</h3>
        <p class="period">${escapeHtml(getScheduleLabel(itinerary.program.scheduleType))}: ${escapeHtml(step.schedule)}</p>
        ${doses}
      </section>
    `;
    })
    .join("");
}

function buildPhytoRows(itinerary: ScaledCropItinerary) {
  return itinerary.program.phyto.categories
    .map((category) => {
      const products = category.products.map((product) => escapeHtml(product)).join(" / ");
      const notes = category.notes
        ? `<p class="meta">Note: ${escapeHtml(category.notes)}</p>`
        : "";

      return `
      <section class="card compact">
        <h3>${escapeHtml(category.label)}</h3>
        <p>${products}</p>
        ${notes}
      </section>
    `;
    })
    .join("");
}

function buildPdfHtml(itinerary: ScaledCropItinerary) {
  const generatedAt = new Date().toLocaleString("fr-FR");

  const notes = (itinerary.program.notes ?? [])
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("");

  const notesBlock = notes
    ? `<section class="card"><h3>Notes</h3><ul>${notes}</ul></section>`
    : "";

  const sources = itinerary.sourcePdf
    .map((source) => `<li>${escapeHtml(source)}</li>`)
    .join("");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #1f2937;
          margin: 28px;
          background: #fffdf5;
        }
        h1 {
          margin: 0 0 6px 0;
          color: #166534;
          font-size: 24px;
        }
        h2 {
          margin-top: 26px;
          margin-bottom: 10px;
          color: #854d0e;
          font-size: 17px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        h3 {
          margin: 0 0 4px 0;
          font-size: 15px;
          color: #14532d;
        }
        .meta {
          margin: 0;
          color: #4b5563;
          font-size: 12px;
        }
        .period {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 12px;
        }
        .header-card {
          border: 1px solid #d9f99d;
          background: #f7fee7;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 18px;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
          background: white;
        }
        .card.compact {
          padding: 10px;
        }
        .dose-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 4px 0;
          border-bottom: 1px dashed #f3f4f6;
          font-size: 13px;
        }
        .dose-row:last-child {
          border-bottom: none;
        }
        ul {
          margin: 8px 0 0 18px;
          padding: 0;
        }
        li {
          margin-bottom: 4px;
          font-size: 12px;
        }
        .disclaimer {
          margin-top: 12px;
          font-size: 11px;
          color: #92400e;
          border: 1px solid #fcd34d;
          background: #fffbeb;
          padding: 10px;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Itineraire technique - ${escapeHtml(itinerary.cropName)}</h1>
      <p class="meta">Document genere le ${escapeHtml(generatedAt)}</p>

      <section class="header-card">
        <p class="meta"><strong>Superficie:</strong> ${escapeHtml(formatDoseValue(itinerary.areaM2))} m2</p>
        <p class="meta"><strong>Mode:</strong> ${escapeHtml(getMethodLabel(itinerary.method))}</p>
        <p class="meta"><strong>Facteur d'echelle:</strong> ${escapeHtml(formatDoseValue(itinerary.scaleFactor))}</p>
        <p class="meta"><strong>Base de calcul:</strong> ${escapeHtml(formatDoseValue(itinerary.baselineAreaM2))} m2</p>
      </section>

      <h2>Programme de fertilisation</h2>
      ${buildFertilizationRows(itinerary)}

      <h2>Protocole phytosanitaire</h2>
      <section class="card">
        <p class="meta"><strong>Frequence preventive:</strong> ${escapeHtml(itinerary.program.phyto.frequency)}</p>
        <p class="meta"><strong>Frequence en attaque:</strong> ${escapeHtml(itinerary.program.phyto.emergencyFrequency)}</p>
      </section>
      ${buildPhytoRows(itinerary)}

      ${notesBlock}

      <section class="card compact">
        <h3>Sources PDF</h3>
        <ul>${sources}</ul>
      </section>

      <div class="disclaimer">${escapeHtml(itinerary.program.phyto.disclaimer)}</div>
    </body>
  </html>
  `;
}

export interface ItineraryPdfExportResult {
  uri: string | null;
  shared: boolean;
  usedPrintDialog: boolean;
}

export async function exportItineraryToPdf(
  itinerary: ScaledCropItinerary,
): Promise<ItineraryPdfExportResult> {
  const html = buildPdfHtml(itinerary);
  try {
    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(
          uri,
          Platform.OS === "ios"
            ? {
                UTI: "com.adobe.pdf",
                mimeType: "application/pdf",
                dialogTitle: `Itineraire ${itinerary.cropName}`,
              }
            : {
                mimeType: "application/pdf",
                dialogTitle: `Itineraire ${itinerary.cropName}`,
              },
        );

        return { uri, shared: true, usedPrintDialog: false };
      } catch {
        return { uri, shared: false, usedPrintDialog: false };
      }
    }

    if (Platform.OS === "ios") {
      await Print.printAsync({ html });
      return { uri, shared: false, usedPrintDialog: true };
    }

    return { uri, shared: false, usedPrintDialog: false };
  } catch {
    if (Platform.OS === "android") {
      try {
        await Print.printAsync({ html });
        return { uri: null, shared: false, usedPrintDialog: true };
      } catch {
        throw new Error(
          "La generation PDF a echoue. Verifiez le service d'impression Android ou testez sur un appareil physique.",
        );
      }
    }

    throw new Error("La generation du PDF a echoue sur cet appareil.");
  }
}
