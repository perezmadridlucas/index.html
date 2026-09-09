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

  try {
    // Generate image using html-to-image (skipFonts prevents CORS errors with external webfonts)
    const imgData = await toPng(targetElement, {
      quality: 0.95,
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

    onProgress?.('Estructurando formato A4...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgProps = pdf.getImageProperties(imgData);

    // Compress strictly into a single A4 page without creating a second page
    const widthRatio = pdfWidth / imgProps.width;
    const heightRatio = pdfPageHeight / imgProps.height;
    const scale = Math.min(widthRatio, heightRatio);

    const renderWidth = imgProps.width * scale;
    const renderHeight = imgProps.height * scale;
    const posX = (pdfWidth - renderWidth) / 2;
    const posY = Math.max(0, (pdfPageHeight - renderHeight) / 2);

    pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight);

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
  }
}

/**
 * Direct Print to PDF trigger
 */
export function printTripDocument() {
  window.print();
}

