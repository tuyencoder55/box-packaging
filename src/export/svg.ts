// Xuất file khuôn SVG chuẩn kỹ thuật (đơn vị mm, layer CUT/CREASE)
import { chainSegments, type Polyline } from '../core/chain';
import type { Dieline } from '../core/types';

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
export function generateSvgContent(dieline: Dieline, margin: number = 5): string {
  const [minX, minY, width, height] = dieline.bbox;

  // Lề quanh khuôn bế
  const originX = minX - margin;
  const originY = minY - margin;
  const totalW = round3(width + margin * 2);
  const totalH = round3(height + margin * 2);

  // Nối các đoạn rời thành polyline liền
  const cutLines = chainSegments(dieline.cut);
  const creaseLines = chainSegments(dieline.crease);

  const cutPaths = cutLines
    .map((line) => `    <path d="${polylineToPathData(line, originX, originY)}" />`)
    .join('\n');

  const creasePaths = creaseLines
    .map((line) => `    <path d="${polylineToPathData(line, originX, originY)}" />`)
    .join('\n');

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
</svg>`;
}
