import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export interface ExportPdfOptions {
  element?: HTMLElement | null;
  filename?: string;
  onProgress?: (msg: string) => void;
}

/**
 * 100% robust, reliable PDF exporter for team documents.
 * Uses native browser SVG foreignObject (html-to-image) to support all modern CSS (oklch, Tailwind 4, flex, grid).
 */
export async function exportTripPlanToPDF({
  element,
  filename = 'Official_Trip_Plan_UCAM_Murcia.pdf',
  onProgress,
}: ExportPdfOptions): Promise<boolean> {
  const targetElement = element || document.getElementById('trip-pdf-document');
  if (!targetElement) {
    throw new Error('No se encontró el elemento del documento de viaje en el DOM.');
  }

  onProgress?.('Generando documento en alta resolución...');

  // Ensure element has dimensions even if parent was styled oddly
  const wasDisplayNone = targetElement.style.display === 'none';
  if (wasDisplayNone) {
    targetElement.style.display = 'block';
  }

  // Preserve original layout styles
  const prevWidth = targetElement.style.width;
  const prevMaxWidth = targetElement.style.maxWidth;
  const prevMinWidth = targetElement.style.minWidth;
  const prevPadding = targetElement.style.padding;
  const prevMargin = targetElement.style.margin;
  const prevBorderRadius = targetElement.style.borderRadius;
  const prevBorder = targetElement.style.border;
  const prevBoxShadow = targetElement.style.boxShadow;

  // Set optimal A4 width (860px) and narrow internal padding (8px 10px) so text distributes widely across the sheet
  const exportWidthPx = 860;
  targetElement.style.width = `${exportWidthPx}px`;
  targetElement.style.maxWidth = `${exportWidthPx}px`;
  targetElement.style.minWidth = `${exportWidthPx}px`;
  targetElement.style.padding = '8px 10px';
  targetElement.style.margin = '0';
  targetElement.style.borderRadius = '0px';
  targetElement.style.border = 'none';
  targetElement.style.boxShadow = 'none';

  try {
    // Generate image using html-to-image (skipFonts prevents CORS errors with external webfonts)
    const imgData = await toPng(targetElement, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
      filter: (node) => {
        // Exclude elements with class 'no-print' if any
        if (node instanceof HTMLElement && node.classList?.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    onProgress?.('Estructurando formato A4 con márgenes laterales estrechos (≤ 0.5 cm)...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgProps = pdf.getImageProperties(imgData);

    // Margins: strictly maximum 0.5 cm (<= 5mm) on the sides as requested
    const lateralMargin = 4.5; // 4.5 mm = 0.45 cm (<= 0.5 cm)
    const renderWidth = pdfWidth - (lateralMargin * 2); // 201 mm
    const posX = lateralMargin; // 4.5 mm

    // Proportional height for the 201 mm width
    const aspectRatio = imgProps.height / imgProps.width;
    let renderHeight = renderWidth * aspectRatio;

    // Available height on A4 with minimum 4.5 mm vertical margin
    const minVerticalMargin = 4.5; // mm
    const maxAvailableHeight = pdfPageHeight - (minVerticalMargin * 2); // 288 mm

    let posY = minVerticalMargin;
    let finalWidth = renderWidth;
    let finalPosX = posX;

    if (renderHeight <= maxAvailableHeight) {
      // Fits comfortably within A4 page height - center vertically
      posY = Math.max(minVerticalMargin, (pdfPageHeight - renderHeight) / 2);
    } else {
      // If content is taller, fit exactly within maxAvailableHeight to guarantee single-page fit
      const scaleDown = maxAvailableHeight / renderHeight;
      renderHeight = maxAvailableHeight;
      finalWidth = renderWidth * scaleDown;
      finalPosX = (pdfWidth - finalWidth) / 2;
    }

    pdf.addImage(imgData, 'PNG', finalPosX, posY, finalWidth, renderHeight);

    onProgress?.('Descargando archivo PDF...');

    // Trigger download with direct blob anchor (works in iframes, standalone HTML, Chrome, Safari, mobile)
    try {
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.target = '_blank';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(blobUrl);
      }, 3000);
    } catch {
      // Fallback to jsPDF standard save
      pdf.save(filename);
    }

    return true;
  } catch (err) {
    console.error('Canvas/PDF export error:', err);
    throw err;
  } finally {
    // Restore original element styling
    targetElement.style.width = prevWidth;
    targetElement.style.maxWidth = prevMaxWidth;
    targetElement.style.minWidth = prevMinWidth;
    targetElement.style.padding = prevPadding;
    targetElement.style.margin = prevMargin;
    targetElement.style.borderRadius = prevBorderRadius;
    targetElement.style.border = prevBorder;
    targetElement.style.boxShadow = prevBoxShadow;

    if (wasDisplayNone) {
      targetElement.style.display = 'none';
    }
  }
}

/**
 * Downloads preview directly as a PNG image
 */
export async function exportTripPlanToImage(
  element?: HTMLElement | null,
  filename = 'Official_Trip_Plan_UCAM_Murcia.png'
): Promise<boolean> {
  const targetElement = element || document.getElementById('trip-pdf-document');
  if (!targetElement) return false;

  const prevWidth = targetElement.style.width;
  const prevMaxWidth = targetElement.style.maxWidth;
  const prevMinWidth = targetElement.style.minWidth;
  const prevPadding = targetElement.style.padding;
  const prevMargin = targetElement.style.margin;
  const prevBorderRadius = targetElement.style.borderRadius;
  const prevBorder = targetElement.style.border;
  const prevBoxShadow = targetElement.style.boxShadow;

  const exportWidthPx = 860;
  targetElement.style.width = `${exportWidthPx}px`;
  targetElement.style.maxWidth = `${exportWidthPx}px`;
  targetElement.style.minWidth = `${exportWidthPx}px`;
  targetElement.style.padding = '8px 10px';
  targetElement.style.margin = '0';
  targetElement.style.borderRadius = '0px';
  targetElement.style.border = 'none';
  targetElement.style.boxShadow = 'none';

  try {
    const imgData = await toPng(targetElement, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.href = imgData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);
    return true;
  } catch (e) {
    console.error('Image export error:', e);
    return false;
  } finally {
    targetElement.style.width = prevWidth;
    targetElement.style.maxWidth = prevMaxWidth;
    targetElement.style.minWidth = prevMinWidth;
    targetElement.style.padding = prevPadding;
    targetElement.style.margin = prevMargin;
    targetElement.style.borderRadius = prevBorderRadius;
    targetElement.style.border = prevBorder;
    targetElement.style.boxShadow = prevBoxShadow;
  }
}

/**
 * Direct Print to PDF trigger
 */
export function printTripDocument() {
  window.print();
}

