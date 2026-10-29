// Xuất file DXF chuẩn AutoCAD R12 (AC1009) cho máy cắt bế CNC và phần mềm CAD
import type { Dieline } from '../core/types';
import type { DimensionLine } from '../render2d/dimensions';

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Sinh nội dung file DXF R12 từ Dieline kèm các đường kích thước (DIMENSION)
 */
export function generateDxfContent(
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
  const totalH = bMaxY - bMinY + margin * 2;

  const lines: string[] = [];

  // 1. Header & Tables
  lines.push('0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '0', 'ENDSEC');

  // Bảng Line types (LTYPE) và Layers
  lines.push('0', 'SECTION', '2', 'TABLES');

  // Bảng LTYPE
  lines.push(
    '0', 'TABLE', '2', 'LTYPE', '70', '2',
    '0', 'LTYPE', '2', 'CONTINUOUS', '70', '0', '3', 'Solid line', '72', '65', '73', '0', '40', '0.0',
    '0', 'LTYPE', '2', 'DASHED', '70', '0', '3', 'Dashed line', '72', '65', '73', '2', '40', '5.0', '49', '3.0', '49', '-2.0',
    '0', 'ENDTAB'
  );

  // Bảng LAYER (CUT màu 6 magenta, CREASE màu 5 cyan, DIMENSION màu 7 white/light grey)
  lines.push(
    '0', 'TABLE', '2', 'LAYER', '70', '3',
    '0', 'LAYER', '2', 'CUT', '70', '0', '62', '6', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'CREASE', '70', '0', '62', '5', '6', 'DASHED',
    '0', 'LAYER', '2', 'DIMENSION', '70', '0', '62', '7', '6', 'CONTINUOUS',
    '0', 'ENDTAB'
  );

  lines.push('0', 'ENDSEC');

  // 2. ENTITIES
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  function writeLine(x1: number, y1: number, x2: number, y2: number, layer: 'CUT' | 'CREASE' | 'DIMENSION') {
    lines.push(
      '0', 'LINE',
      '8', layer,
      '10', round3(x1).toString(),
      '20', round3(y1).toString(),
      '30', '0.0',
      '11', round3(x2).toString(),
      '21', round3(y2).toString(),
      '31', '0.0'
    );
  }

  // Ghi từng đoạn CREASE riêng biệt (độc lập, dễ dàng chọn và chỉnh sửa trong CAD)
  for (const seg of dieline.crease) {
    const x1 = seg.a[0] - originX;
    const y1 = totalH - (seg.a[1] - originY);
    const x2 = seg.b[0] - originX;
    const y2 = totalH - (seg.b[1] - originY);
    writeLine(x1, y1, x2, y2, 'CREASE');
  }

  // Ghi từng đoạn CUT riêng biệt (độc lập, dễ dàng chọn và chỉnh sửa trong CAD)
  for (const seg of dieline.cut) {
    const x1 = seg.a[0] - originX;
    const y1 = totalH - (seg.a[1] - originY);
    const x2 = seg.b[0] - originX;
    const y2 = totalH - (seg.b[1] - originY);
    writeLine(x1, y1, x2, y2, 'CUT');
  }

  // Ghi các đường kích thước DIMENSION (nếu có)
  for (const dim of dimLines) {
    const x1 = dim.start[0] - originX;
    const y1 = totalH - (dim.start[1] - originY);
    const x2 = dim.end[0] - originX;
    const y2 = totalH - (dim.end[1] - originY);
    const xm = round3(dim.mid[0] - originX);
    const ym = round3(totalH - (dim.mid[1] - originY));

    // Đoạn thẳng đo kích thước
    writeLine(x1, y1, x2, y2, 'DIMENSION');

    // Chữ số đo kích thước (Text cao 3.5mm chuẩn bản vẽ kỹ thuật CAD)
    if (dim.label && dim.label.trim()) {
      lines.push(
        '0', 'TEXT',
        '8', 'DIMENSION',
        '10', xm.toString(),
        '20', ym.toString(),
        '30', '0.0',
        '40', '3.5',
        '1', dim.label,
        '72', '1', // Căn giữa Center (horizontal)
        '11', xm.toString(),
        '21', ym.toString(),
        '31', '0.0'
      );
    }
  }

  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');

  return lines.join('\n') + '\n';
}
