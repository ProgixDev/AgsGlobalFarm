import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";
import {
  formatArea,
  formatDose,
  formatNumber,
  getScheduleLabel,
} from "@/utils/itinerary-calc";

const PDF_DIR_NAME = "itineraires";

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
              formatDose(dose.scaledDose, dose.unit),
            )}</strong></div>`,
        )
        .join("");

      return `
      <section class="card">
        <h3>${escapeHtml(step.label)}</h3>
        <p class="period">${escapeHtml(getScheduleLabel(itinerary.program.scheduleType))} : ${escapeHtml(step.schedule)}</p>
        ${doses}
      </section>
    `;
    })
    .join("");
}

function buildPhytoRows(itinerary: ScaledCropItinerary) {
  return itinerary.program.phyto.categories
    .map((category) => {
      const products = category.products.map((p) => escapeHtml(p)).join(" / ");
      return `
      <section class="card compact">
        <h3>${escapeHtml(category.label)}</h3>
        <p>${products}</p>
      </section>
    `;
    })
    .join("");
}

function buildHtml(itinerary: ScaledCropItinerary) {
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
        @page { margin: 24mm 16mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #1f2937;
          background: #fffdf5;
        }
        h1 { margin: 0 0 6px 0; color: #166534; font-size: 24px; }
        h2 {
          margin-top: 26px; margin-bottom: 10px;
          color: #854d0e; font-size: 17px;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        h3 { margin: 0 0 4px 0; font-size: 15px; color: #14532d; }
        .meta { margin: 0; color: #4b5563; font-size: 12px; }
        .period { margin: 0 0 8px 0; color: #6b7280; font-size: 12px; }
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
        .card.compact { padding: 10px; }
        .dose-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 4px 0;
          border-bottom: 1px dashed #f3f4f6;
          font-size: 13px;
        }
        .dose-row:last-child { border-bottom: none; }
        ul { margin: 8px 0 0 18px; padding: 0; }
        li { margin-bottom: 4px; font-size: 12px; }
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
      <h1>Itinéraire technique – ${escapeHtml(itinerary.cropName)}</h1>
      <p class="meta">Document généré le ${escapeHtml(generatedAt)}</p>

      <section class="header-card">
        <p class="meta"><strong>Superficie :</strong> ${escapeHtml(formatArea(itinerary.areaM2))}</p>
        <p class="meta"><strong>Base de calcul :</strong> ${escapeHtml(formatArea(itinerary.baselineAreaM2))}</p>
        <p class="meta"><strong>Facteur d'échelle :</strong> ×${escapeHtml(formatNumber(itinerary.scaleFactor))}</p>
        <p class="meta"><strong>Note :</strong> ${escapeHtml(itinerary.cultivationNote)}</p>
      </section>

      <h2>Programme de fertilisation</h2>
      ${buildFertilizationRows(itinerary)}

      <h2>Protocole phytosanitaire</h2>
      <section class="card">
        <p class="meta"><strong>Préventif :</strong> ${escapeHtml(itinerary.program.phyto.frequency)}</p>
        <p class="meta"><strong>En cas d'attaque :</strong> ${escapeHtml(itinerary.program.phyto.emergencyFrequency)}</p>
      </section>
      ${buildPhytoRows(itinerary)}

      ${notesBlock}

      <section class="card compact">
        <h3>Source(s)</h3>
        <ul>${sources}</ul>
      </section>

      <div class="disclaimer">${escapeHtml(itinerary.program.phyto.disclaimer)}</div>
    </body>
  </html>
  `;
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildPdfFileName(cropName: string, areaM2: number) {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
  return `itineraire-${slugify(cropName)}-${Math.round(areaM2)}m2-${stamp}.pdf`;
}

function ensurePersistentDir(): Directory {
  const dir = new Directory(Paths.document, PDF_DIR_NAME);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

export interface GeneratedPdf {
  uri: string;
  fileName: string;
  savedToDownloads: boolean;
}

/**
 * Generate PDF and persist into app document directory. The file URI is stable
 * across launches and is the canonical handle for re-sharing later.
 */
export async function generatePdf(
  itinerary: ScaledCropItinerary,
): Promise<GeneratedPdf> {
  const html = buildHtml(itinerary);
  const fileName = buildPdfFileName(itinerary.cropName, itinerary.areaM2);

  const printResult = await Print.printToFileAsync({ html });
  if (!printResult?.uri) {
    throw new Error("La génération du PDF a échoué.");
  }

  const tempFile = new File(printResult.uri);
  const dir = ensurePersistentDir();
  const persistent = new File(dir, fileName);

  if (persistent.exists) {
    persistent.delete();
  }

  tempFile.copy(persistent);

  try {
    tempFile.delete();
  } catch {
    // Ignore cleanup errors — temp file lives in print cache anyway.
  }

  const persistentUri = persistent.uri.startsWith("file://") || persistent.uri.startsWith("content://")
    ? persistent.uri
    : `file://${persistent.uri}`;

  return {
    uri: persistentUri,
    fileName,
    savedToDownloads: false,
  };
}

/**
 * Open the system share sheet so the user can save the PDF to Downloads,
 * Drive, WhatsApp, etc. This is the only reliable way to expose the file
 * outside the app sandbox on modern Android (scoped storage forbids direct
 * writes to the Downloads folder for non-media files).
 */
export async function sharePdf(uri: string, cropName: string) {
  if (!uri) throw new Error("URI du PDF manquant.");
  // expo-sharing uses FileProvider with correct path config — works on Android API 30+
  // react-native-share v12.1.1+ broke FileProvider, causing getScheme() null crash
  const fileUri = uri.startsWith("file://") ? uri : `file://${uri}`;
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error("Le partage n'est pas disponible sur cet appareil.");
  await Sharing.shareAsync(fileUri, {
    mimeType: "application/pdf",
    dialogTitle: `Itinéraire ${cropName}`,
    UTI: "com.adobe.pdf",
  });
}

export function pdfFileExists(uri: string | null | undefined): boolean {
  if (!uri) return false;
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}
