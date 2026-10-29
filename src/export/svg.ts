// Xuất file khuôn SVG chuẩn kỹ thuật (đơn vị mm, layer CUT/CREASE/DIMENSION)
// Từng đoạn line được xuất riêng biệt giúp dễ dàng chọn và chỉnh sửa trong Adobe Illustrator & phần mềm CAD
import type { Dieline } from '../core/types';
import type { DimensionLine } from '../render2d/dimensions';

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Sinh nội dung file SVG kỹ thuật có layer riêng biệt cho máy in và máy cắt bế
 */
export function generateSvgContent(
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

  // Lề quanh khuôn bế và đường kích thước
  const originX = bMinX - margin;
  const originY = bMinY - margin;
  const totalW = round3(bMaxX - bMinX + margin * 2);
  const totalH = round3(bMaxY - bMinY + margin * 2);

  // Xuất từng đoạn thẳng riêng biệt (độc lập trong panel Layers của Illustrator)
  const cutElements = dieline.cut
    .map(
      (s) =>
        `    <line x1="${round3(s.a[0] - originX)}" y1="${round3(s.a[1] - originY)}" x2="${round3(s.b[0] - originX)}" y2="${round3(s.b[1] - originY)}" />`
    )
    .join('\n');

  const creaseElements = dieline.crease
    .map(
      (s) =>
        `    <line x1="${round3(s.a[0] - originX)}" y1="${round3(s.a[1] - originY)}" x2="${round3(s.b[0] - originX)}" y2="${round3(s.b[1] - originY)}" />`
    )
    .join('\n');

  let dimElements = '';
  if (dimLines.length > 0) {
    const dimParts: string[] = [];
    for (const d of dimLines) {
      const x1 = round3(d.start[0] - originX);
      const y1 = round3(d.start[1] - originY);
      const x2 = round3(d.end[0] - originX);
      const y2 = round3(d.end[1] - originY);
      const xm = round3(d.mid[0] - originX);
      const ym = round3(d.mid[1] - originY);

      dimParts.push(`    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`);
      if (d.label && d.label.trim()) {
        dimParts.push(`    <text x="${xm}" y="${ym}" text-anchor="middle">${d.label}</text>`);
      }
    }
    dimElements = `  <!-- Layer DIMENSION (Đường đo và nhãn kích thước) -->
  <g id="DIMENSION" fill="#666666" stroke="#888888" stroke-width="0.2" font-size="3" font-family="Arial, sans-serif">
${dimParts.join('\n')}
  </g>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${totalW}mm"
     height="${totalH}mm"
     viewBox="0 0 ${totalW} ${totalH}">
  <!-- Layer CREASE (Dao cấn / Đường gấp) -->
  <g id="CREASE" fill="none" stroke="#00aeef" stroke-width="0.25" stroke-dasharray="3 2">
${creaseElements}
  </g>
  <!-- Layer CUT (Dao cắt bế ngoài) -->
  <g id="CUT" fill="none" stroke="#ff00ff" stroke-width="0.25">
${cutElements}
  </g>
${dimElements}</svg>`;
}
