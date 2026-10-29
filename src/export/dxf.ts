// Xuất file DXF chuẩn AutoCAD R12 (AC1009) cho máy cắt bế CNC và phần mềm CAD
import { chainSegments, type Polyline } from '../core/chain';
import type { Dieline } from '../core/types';

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Sinh nội dung file DXF R12 từ Dieline
 */
export function generateDxfContent(dieline: Dieline, margin: number = 5): string {
  const [minX, minY, , height] = dieline.bbox;
  const originX = minX - margin;
  const originY = minY - margin;
  const totalH = height + margin * 2;

  // Nối các đoạn rời thành polyline
  const cutLines = chainSegments(dieline.cut);
  const creaseLines = chainSegments(dieline.crease);

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

  // Bảng LAYER (CUT màu 6 magenta, CREASE màu 5 cyan)
  lines.push(
    '0', 'TABLE', '2', 'LAYER', '70', '2',
    '0', 'LAYER', '2', 'CUT', '70', '0', '62', '6', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'CREASE', '70', '0', '62', '5', '6', 'DASHED',
    '0', 'ENDTAB'
  );

  lines.push('0', 'ENDSEC');

  // 2. ENTITIES
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  function writePolyline(line: Polyline, layer: 'CUT' | 'CREASE') {
    if (line.pts.length === 0) return;

    // 70 = 1 nếu đóng (closed), 0 nếu hở
    lines.push(
      '0', 'POLYLINE',
      '8', layer,
      '66', '1',
      '70', line.closed ? '1' : '0'
    );

    for (const pt of line.pts) {
      // DXF có trục Y hướng lên trên: y' = totalH - (y - originY)
      const x = round3(pt[0] - originX);
      const y = round3(totalH - (pt[1] - originY));

      lines.push(
        '0', 'VERTEX',
        '8', layer,
        '10', x.toString(),
        '20', y.toString(),
        '30', '0.0'
      );
    }

    lines.push('0', 'SEQEND', '8', layer);
  }

  // Ghi các đường CREASE
  for (const line of creaseLines) {
    writePolyline(line, 'CREASE');
  }

  // Ghi các đường CUT
  for (const line of cutLines) {
    writePolyline(line, 'CUT');
  }

  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');

  return lines.join('\n') + '\n';
}
