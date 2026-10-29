// Xuất file PDF chuẩn in ấn: 3 Layer OCG (CUT, CREASE, DIMENSION), màu pha Separation CMYK, Overprint
// Từng đoạn line được vẽ riêng biệt, độc lập giúp dễ dàng chọn và chỉnh sửa trong Illustrator
import type { Dieline } from '../core/types';
import type { DimensionLine } from '../render2d/dimensions';
import { PdfWriter } from './pdfWriter';

const MM_TO_PT = 72 / 25.4;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Sinh file PDF hoàn chỉnh chuẩn nhà in kèm các đường kích thước (DIMENSION)
 */
export function generatePdfContent(
  dieline: Dieline,
  margin: number = 5,
  dimLines: DimensionLine[] = []
): string {
  let bMinX = dieline.bbox[0];
  let bMinY = dieline.bbox[1];
  let bMaxX = dieline.bbox[0] + dieline.bbox[2];
  let bMaxY = dieline.bbox[1] + dieline.bbox[3];

  for (const d of dimLines) {
    bMinX = Math.min(bMinX, d.start[0], d.end[0], d.mid[0] - 10);
    bMinY = Math.min(bMinY, d.start[1], d.end[1], d.mid[1] - 8);
    bMaxX = Math.max(bMaxX, d.start[0], d.end[0], d.mid[0] + 10);
    bMaxY = Math.max(bMaxY, d.start[1], d.end[1], d.mid[1] + 8);
  }

  const originX = bMinX - margin;
  const originY = bMinY - margin;
  const totalW_mm = bMaxX - bMinX + margin * 2;
  const totalH_mm = bMaxY - bMinY + margin * 2;

  const totalW_pt = round3(totalW_mm * MM_TO_PT);
  const totalH_pt = round3(totalH_mm * MM_TO_PT);

  const trimMinX_pt = round3(margin * MM_TO_PT);
  const trimMinY_pt = round3(margin * MM_TO_PT);
  const trimMaxX_pt = round3((margin + dieline.bbox[2]) * MM_TO_PT);
  const trimMaxY_pt = round3((margin + dieline.bbox[3]) * MM_TO_PT);

  const toPtX = (x: number) => round3((x - originX) * MM_TO_PT);
  const toPtY = (y: number) => round3((totalH_mm - (y - originY)) * MM_TO_PT);

  // Xây dựng Content Stream
  let streamBody = '/GS_OP gs\n'; // Kích hoạt Overprint
  streamBody += '0.709 w\n'; // Nét dày 0.25 mm (0.709 pt)

  // 1. Layer CREASE (Đường nếp cấn từng đoạn riêng biệt)
  streamBody += '/OC /OC_CREASE BDC\n';
  streamBody += '/CS_CREASE CS 1 SCN\n';
  streamBody += '[8.504 5.669] 0 d\n'; // Nét đứt: 3 mm nét (8.504 pt), 2 mm hở (5.669 pt)

  for (const seg of dieline.crease) {
    const x1 = toPtX(seg.a[0]);
    const y1 = toPtY(seg.a[1]);
    const x2 = toPtX(seg.b[0]);
    const y2 = toPtY(seg.b[1]);
    streamBody += `${x1} ${y1} m ${x2} ${y2} l S\n`;
  }
  streamBody += 'EMC\n';

  // 2. Layer CUT (Đường dao cắt ngoài từng đoạn riêng biệt)
  streamBody += '/OC /OC_CUT BDC\n';
  streamBody += '/CS_CUT CS 1 SCN\n';
  streamBody += '[] 0 d\n'; // Nét liền

  for (const seg of dieline.cut) {
    const x1 = toPtX(seg.a[0]);
    const y1 = toPtY(seg.a[1]);
    const x2 = toPtX(seg.b[0]);
    const y2 = toPtY(seg.b[1]);
    streamBody += `${x1} ${y1} m ${x2} ${y2} l S\n`;
  }
  streamBody += 'EMC\n';

  // 3. Layer DIMENSION (Đường đo và nhãn kích thước)
  if (dimLines.length > 0) {
    streamBody += '/OC /OC_DIM BDC\n';
    streamBody += '0.5 w\n';
    streamBody += '[] 0 d\n';
    streamBody += '0.4 0.4 0.4 RG\n'; // Màu xám đậm cho đường nét
    streamBody += '0.4 0.4 0.4 rg\n'; // Màu xám đậm cho chữ

    for (const d of dimLines) {
      const x1 = round3((d.start[0] - originX) * MM_TO_PT);
      const y1 = round3((totalH_mm - (d.start[1] - originY)) * MM_TO_PT);
      const x2 = round3((d.end[0] - originX) * MM_TO_PT);
      const y2 = round3((totalH_mm - (d.end[1] - originY)) * MM_TO_PT);
      const xm = round3((d.mid[0] - originX) * MM_TO_PT);
      const ym = round3((totalH_mm - (d.mid[1] - originY)) * MM_TO_PT);

      streamBody += `${x1} ${y1} m ${x2} ${y2} l S\n`;
      if (d.label && d.label.trim()) {
        streamBody += `BT /F1 8 Tf 1 0 0 1 ${xm} ${ym} Tm (${d.label}) Tj ET\n`;
      }
    }
    streamBody += 'EMC\n';
  }

  const writer = new PdfWriter();

  // Obj 1: Catalog
  writer.addObject(
    '<< /Type /Catalog /Pages 2 0 R /OCProperties << /OCGs [4 0 R 5 0 R 10 0 R] /D << /Order [4 0 R 5 0 R 10 0 R] /ON [4 0 R 5 0 R 10 0 R] >> >> >>'
  );

  // Obj 2: Pages
  writer.addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

  // Obj 3: Page
  writer.addObject(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${totalW_pt} ${totalH_pt}] /TrimBox [${trimMinX_pt} ${trimMinY_pt} ${trimMaxX_pt} ${trimMaxY_pt}] /Resources << /Properties << /OC_CUT 4 0 R /OC_CREASE 5 0 R /OC_DIM 10 0 R >> /ColorSpace << /CS_CUT 6 0 R /CS_CREASE 7 0 R >> /Font << /F1 11 0 R >> /ExtGState << /GS_OP 8 0 R >> >> /Contents 9 0 R >>`
  );

  // Obj 4: OCG CUT
  writer.addObject('<< /Type /OCG /Name (CUT) >>');

  // Obj 5: OCG CREASE
  writer.addObject('<< /Type /OCG /Name (CREASE) >>');

  // Obj 6: Separation CUT (Magenta 100%)
  writer.addObject(
    '[/Separation /CUT /DeviceCMYK << /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [0 1 0 0] /N 1 >>]'
  );

  // Obj 7: Separation CREASE (Cyan 100%)
  writer.addObject(
    '[/Separation /CREASE /DeviceCMYK << /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [1 0 0 0] /N 1 >>]'
  );

  // Obj 8: ExtGState Overprint
  writer.addObject('<< /Type /ExtGState /OP true /op true /OPM 1 >>');

  // Obj 9: Content Stream (được thêm sau khi tính xong streamBody)
  const streamLen = streamBody.length;
  writer.addObject(`<< /Length ${streamLen} >>\nstream\n${streamBody}endstream`);

  // Obj 10: OCG DIMENSION
  writer.addObject('<< /Type /OCG /Name (DIMENSION) >>');

  // Obj 11: Font Helvetica cho kích thước
  writer.addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  return writer.build();
}
