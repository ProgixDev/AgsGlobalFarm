import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import fs from "fs/promises";
import type { CertificateData } from "@/types";

async function loadTemplateImage(pdfDoc: PDFDocument) {
  const publicDir = path.join(process.cwd(), "src/assets");

  // Try PNG first, then JPG/JPEG
  const candidates = [
    {
      file: "CERTIFICAT.jpg",
      embed: (b: Uint8Array) => pdfDoc.embedJpg(b),
    },
  ];

  for (const { file, embed } of candidates) {
    try {
      const filePath = path.join(publicDir, file);
      const bytes = await fs.readFile(filePath);
      const image = await embed(bytes);
      return image;
    } catch {
      // File doesn't exist or can't be embedded, try next
    }
  }

  throw new Error(
    "Certificate template not found. Place certificate-template.png or certificate-template.jpg in the public/ directory.",
  );
}

export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Uint8Array> {
  const { userName, completionDate } = data;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Load and embed the template image (supports PNG and JPG)
  const templateImage = await loadTemplateImage(pdfDoc);
  const { width: imgWidth, height: imgHeight } = templateImage.scale(1);

  // Create a landscape page matching the template aspect ratio
  // Use A4 landscape-ish dimensions scaled to template ratio
  const pageWidth = 842; // ~A4 landscape width in points
  const pageHeight = (imgHeight / imgWidth) * pageWidth;

  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Draw the template as background (full page)
  page.drawImage(templateImage, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });

  // Embed fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesBoldItalic = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBoldItalic,
  );

  // Colors
  const darkGreen = rgb(0.0, 0.3, 0.15);
  const darkText = rgb(0.1, 0.1, 0.1);

  // Format the completion date
  const dateStr = completionDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // --- Draw dynamic text overlays ---

  // Date - positioned above the name, centered
  const dateText = dateStr;
  const dateFontSize = 18;
  const dateWidth = timesBoldItalic.widthOfTextAtSize(dateText, dateFontSize);
  page.drawText(dateText, {
    x: (pageWidth - dateWidth) / 2,
    y: pageHeight * 0.6,
    size: dateFontSize,
    font: timesBoldItalic,
    color: darkGreen,
  });

  // User name - large, bold, centered
  const nameText = userName.toUpperCase();
  const nameFontSize = 38;
  const nameWidth = helveticaBold.widthOfTextAtSize(nameText, nameFontSize);

  // If name is too wide, reduce font size
  let finalNameFontSize = nameFontSize;
  let finalNameWidth = nameWidth;
  if (nameWidth > pageWidth * 0.7) {
    finalNameFontSize = Math.floor(
      (nameFontSize * pageWidth * 0.7) / nameWidth,
    );
    finalNameWidth = helveticaBold.widthOfTextAtSize(
      nameText,
      finalNameFontSize,
    );
  }

  page.drawText(nameText, {
    x: (pageWidth - finalNameWidth) / 2,
    y: pageHeight * 0.52,
    size: finalNameFontSize,
    font: helveticaBold,
    color: darkText,
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
