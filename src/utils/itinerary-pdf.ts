import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import {
  formatArea,
  formatDose,
  formatNumber,
  getScheduleLabel,
} from "@/utils/itinerary-calc";
import { getLogoDataUri } from "@/utils/pdf-assets";

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
  const isWeekly = itinerary.program.scheduleType === "weekly";
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
        <p class="period">${escapeHtml(getScheduleLabel(itinerary.program.scheduleType))} : ${escapeHtml(step.schedule)}${isWeekly ? "" : ""}</p>
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

function buildSpecsBlock(itinerary: ScaledCropItinerary): string {
  const specs = itinerary.specs;
  if (!specs) return "";
  const rows: { label: string; value?: string }[] = [
    { label: "pH", value: specs.ph },
    { label: "Conductivité", value: specs.conductivity },
    { label: "Température", value: specs.temperature },
    { label: "Durée du cycle", value: specs.cycleDuration },
    { label: "Rendement moyen", value: specs.averageYield },
    { label: "Pieds & écartement", value: specs.plantSpacing },
  ].filter((row) => !!row.value);

  if (rows.length === 0) return "";

  const cells = rows
    .map(
      (row) => `
        <div class="spec-cell">
          <span class="spec-label">${escapeHtml(row.label)}</span>
          <span class="spec-value">${escapeHtml(row.value!)}</span>
        </div>
      `,
    )
    .join("");

  return `
    <section class="specs-card">
      <h3>Caractéristiques agronomiques</h3>
      <div class="specs-grid">${cells}</div>
    </section>
  `;
}

function stripDuplicateLabel(label: string, value: string): string {
  // Server data sometimes ships the value with the label re-prepended
  // ("En cas d'attaque : En cas d'attaque : 2 fois..."). Strip the
  // redundant prefix while keeping the original value otherwise intact.
  const trimmed = value.trim();
  const prefix = `${label.trim()} :`;
  if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
    return trimmed.slice(prefix.length).trim();
  }
  return trimmed;
}

function buildHtml(itinerary: ScaledCropItinerary, logoDataUri: string | null) {
  const generatedAt = new Date().toLocaleString("fr-FR");
  const isWeekly = itinerary.program.scheduleType === "weekly";

  const notes = (itinerary.program.notes ?? [])
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("");

  const notesBlock = notes
    ? `<section class="card"><h3>Notes</h3><ul>${notes}</ul></section>`
    : "";

  const fertilizationTitle = isWeekly
    ? "Programme de fertilisation par semaine"
    : "Programme de fertilisation";

  const preventiveValue = stripDuplicateLabel(
    "Préventif",
    itinerary.program.phyto.frequency,
  );
  const emergencyValue = stripDuplicateLabel(
    "En cas d'attaque",
    itinerary.program.phyto.emergencyFrequency,
  );

  // Build SVG wrapper for logo with opacity (CSS has no background-opacity).
  // SVG sized to one A4 content area (210mm × 265mm with 18/14mm margins),
  // logo centered. Used as body background-image with repeat-y so each
  // page renders one watermark. `print-color-adjust: exact` forces browsers
  // to actually print the body background.
  const watermarkBg = logoDataUri
    ? (() => {
        // Logo positioned in top-third of 265mm tile, rotated for watermark feel.
        // Rotation pivot at logo center (105, 90). Size 150×120 covers more of
        // the page. Rotated bounding box reaches roughly y=-6..186 in tile,
        // so last page needs ≥186mm of body content for full render — short
        // last pages still show partial watermark from the top.
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="265mm" viewBox="0 0 210 265"><g transform="rotate(-22 105 90)" opacity="0.10"><image href="${logoDataUri}" x="30" y="30" width="150" height="120" preserveAspectRatio="xMidYMid meet"/></g></svg>`;
        const b64 = (globalThis as any).btoa
          ? (globalThis as any).btoa(unescape(encodeURIComponent(svg)))
          : Buffer.from(svg, "utf8").toString("base64");
        return `data:image/svg+xml;base64,${b64}`;
      })()
    : null;

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page {
          margin: 18mm 0 14mm 0;
        }
        html, body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #1f2937;
          background: #fffdf5;
        }
        body {
          position: relative;
          padding-bottom: 8mm;
          ${watermarkBg
            ? `background-image: url("${watermarkBg}");
          background-repeat: repeat-y;
          background-position: center top;
          background-size: 100% 265mm;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;`
            : ""}
        }
        .brand-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 14px;
        }
        .brand-logo-top {
          width: 64px;
          height: 64px;
          object-fit: contain;
          margin-bottom: 8px;
        }
        .brand-header {
          margin-bottom: 6px;
        }
        .brand-text { flex: 1; }
        h1 { margin: 0 0 4px 0; color: #166534; font-size: 24px; }
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
          margin-bottom: 12px;
        }
        .specs-card {
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 18px;
        }
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px 18px;
        }
        .spec-cell {
          display: flex;
          flex-direction: column;
          padding: 4px 0;
          border-bottom: 1px dashed #f3f4f6;
        }
        .spec-cell:last-child { border-bottom: none; }
        .spec-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .spec-value {
          font-size: 13px;
          color: #1f2937;
          font-weight: 600;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
          background: white;
        }
        .card.compact { padding: 10px; }
        .page-footer {
          margin-top: 32px;
          padding: 10px 16px;
          font-size: 11px;
          color: #92400e;
          border: 1px solid #fcd34d;
          background: #fffbeb;
          border-radius: 10px;
          text-align: center;
          font-style: italic;
        }
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
      </style>
    </head>
    <body>
      ${logoDataUri ? `<div class="brand-top"><img class="brand-logo-top" src="${logoDataUri}" alt="AGS Global Farm" /></div>` : ""}

      <div class="brand-header">
        <div class="brand-text">
          <h1>Itinéraire technique – ${escapeHtml(itinerary.cropName)}</h1>
          <p class="meta">Document généré le ${escapeHtml(generatedAt)} • AGS Global Farm</p>
        </div>
      </div>

      <section class="header-card">
        <p class="meta"><strong>Superficie :</strong> ${escapeHtml(formatArea(itinerary.areaM2))}</p>
        <p class="meta"><strong>Base de calcul :</strong> ${escapeHtml(formatArea(itinerary.baselineAreaM2))}</p>
        <p class="meta"><strong>Facteur d'échelle :</strong> ×${escapeHtml(formatNumber(itinerary.scaleFactor))}</p>
        <p class="meta"><strong>Note :</strong> ${escapeHtml(itinerary.cultivationNote)}</p>
      </section>

      ${buildSpecsBlock(itinerary)}

      <h2>${escapeHtml(fertilizationTitle)}</h2>
      ${buildFertilizationRows(itinerary)}

      <h2>Protocole phytosanitaire</h2>
      <section class="card">
        <p class="meta"><strong>Préventif :</strong> ${escapeHtml(preventiveValue)}</p>
        <p class="meta"><strong>En cas d'attaque :</strong> ${escapeHtml(emergencyValue)}</p>
      </section>
      ${buildPhytoRows(itinerary)}

      ${notesBlock}
      <div class="page-footer">Veuillez lire la notice d&#x27;emballage et respecter la dose des produits phytosanitaires</div>
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
  const logoDataUri = await getLogoDataUri();
  const html = buildHtml(itinerary, logoDataUri);
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

/**
 * Open the PDF directly in a viewer app (Android) or fall back to share sheet (iOS).
 * On Android, IntentLauncher fires ACTION_VIEW with the file:// URI — the system
 * resolves it to a PDF viewer without showing the full share sheet.
 * On iOS there is no direct "open file" API; share sheet is the only mechanism.
 */
export async function openPdf(uri: string, cropName: string) {
  if (!uri) throw new Error("URI du PDF manquant.");

  const fileUri = uri.startsWith("file://") ? uri : `file://${uri}`;

  if (Platform.OS === "android") {
    const contentUri = await FileSystemLegacy.getContentUriAsync(fileUri);
    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: "application/pdf",
    });
    return;
  }

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
