import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import QRCode from 'qrcode'

const FUENTES_GENERICAS: { [key: string]: StandardFonts } = {
  'sans-serif': StandardFonts.Helvetica,
  'serif': StandardFonts.TimesRoman,
  'monospace': StandardFonts.Courier,
};

export async function editPDF(pdfBase64: string, elementos: any[]): Promise<string> {
  const pdfDoc = await PDFDocument.load(pdfBase64);
  pdfDoc.registerFontkit(fontkit);
  const firstPage = pdfDoc.getPages()[0];

  const elementosAColocar = elementos.filter(elem => !(elem.nombre === "timbre_firma" && elem.tipo === "imagen"));

  await procesarElementos(firstPage, elementosAColocar);

  return Buffer.from(await pdfDoc.save()).toString('base64');
}

async function procesarElementos(page: PDFPage, elementos: any[]): Promise<void> {
  for (const elemento of elementos) {
    if (elemento.tipo === 'texto') {
      await dibujarTexto(page, elemento);
    } else if (elemento.tipo === 'qr') {
      await dibujarQR(page, elemento);
    }
    // Aquí puedes agregar más condiciones para otros tipos de elementos si es necesario
  }
}

async function dibujarTexto(page: PDFPage, elemento: any): Promise<void> {
  try {
    const font = await getFont(page.doc, elemento.font);
    page.drawText(elemento.valor, {
      x: elemento.x,
      y: page.getHeight() - elemento.y,  // Ajustamos la coordenada Y
      size: elemento.size,
      font: font,
      color: rgb(0, 0, 0)
    });
  } catch (error) {
    console.error('Error al dibujar texto:', error);
  }
}

async function dibujarQR(page: PDFPage, elemento: any): Promise<void> {
  const qrCodeDataUrl = await QRCode.toDataURL(elemento.valor, {
    width: elemento.w,
    margin: 0
  });
  const qrCodeImage = await fetch(qrCodeDataUrl).then(res => res.arrayBuffer());
  const image = await page.doc.embedPng(new Uint8Array(qrCodeImage));
  page.drawImage(image, {
    x: elemento.x,
    y: page.getHeight() - elemento.y - elemento.w,  // Ajustamos la coordenada Y
    width: elemento.w,
    height: elemento.w
  });
}

async function getFont(pdfDoc: PDFDocument, fontName: string): Promise<PDFFont> {
  const fontNameLower = fontName.toLowerCase();
  if (fontNameLower in FUENTES_GENERICAS) {
    return await pdfDoc.embedFont(FUENTES_GENERICAS[fontNameLower]);
  } else if (Object.values(StandardFonts).includes(fontName as StandardFonts)) {
    return await pdfDoc.embedFont(fontName as StandardFonts);
  } else {
    console.warn(`Fuente "${fontName}" no reconocida. Usando Helvetica como fallback.`);
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  }
}