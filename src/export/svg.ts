// Xuất file khuôn SVG chuẩn kỹ thuật (đơn vị mm, layer CUT/CREASE/DIMENSION)
import { chainSegments, type Polyline } from '../core/chain';
import type { Dieline } from '../core/types';
import type { DimensionLine } from '../render2d/dimensions';

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function polylineToPathData(line: Polyline, originX: number, originY: number): string {
  if (line.pts.length === 0) return '';
  const parts: string[] = [];
  const p0 = line.pts[0];
  parts.push(`M ${round3(p0[0] - originX)} ${round3(p0[1] - originY)}`);

  for (let i = 1; i < line.pts.length; i++) {
    const pt = line.pts[i];
    parts.push(`L ${round3(pt[0] - originX)} ${round3(pt[1] - originY)}`);
  }

  if (line.closed) {
    parts.push('Z');
  }

  return parts.join(' ');
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
    if (d.start[0] < bMinX) bMinX = d.start[0];
    if (d.start[1] < bMinY) bMinY = d.start[1];
    if (d.start[0] > bMaxX) bMaxX = d.start[0];
    if (d.start[1] > bMaxY) bMaxY = d.start[1];

    if (d.end[0] < bMinX) bMinX = d.end[0];
    if (d.end[1] < bMinY) bMinY = d.end[1];
    if (d.end[0] > bMaxX) bMaxX = d.end[0];
    if (d.end[1] > bMaxY) bMaxY = d.end[1];
  }

  // Lề quanh khuôn bế và đường kích thước
  const originX = bMinX - margin;
  const originY = bMinY - margin;
  const totalW = round3(bMaxX - bMinX + margin * 2);
  const totalH = round3(bMaxY - bMinY + margin * 2);

  // Nối các đoạn rời thành polyline liền
  const cutLines = chainSegments(dieline.cut);
  const creaseLines = chainSegments(dieline.crease);

  const cutPaths = cutLines
    .map((line) => `    <path d="${polylineToPathData(line, originX, originY)}" />`)
    .join('\n');

  const creasePaths = creaseLines
    .map((line) => `    <path d="${polylineToPathData(line, originX, originY)}" />`)
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
${creasePaths}
  </g>
  <!-- Layer CUT (Dao cắt bế ngoài) -->
  <g id="CUT" fill="none" stroke="#ff00ff" stroke-width="0.25">
${cutPaths}
  </g>
${dimElements}</svg>`;
}
