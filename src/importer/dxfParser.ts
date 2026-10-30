// Bộ phân tích file DXF (AutoCAD R12/2000+) thành các đoạn thẳng Cut và Crease
import type { Pt } from '../core/types';
import type { RawSegment } from './types';

export function parseDxfString(dxfContent: string): { segments: RawSegment[]; bbox: [number, number, number, number] } {
  const lines = dxfContent.split(/\r?\n/).map((l) => l.trim());
  const segments: RawSegment[] = [];

  let i = 0;
  const n = lines.length;

  while (i < n - 1) {
    const code = lines[i];
    const val = lines[i + 1];

    if (code === '0' && val === 'LINE') {
      i += 2;
      let layer = '0';
      let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

      while (i < n - 1 && lines[i] !== '0') {
        const c = lines[i];
        const v = lines[i + 1];
        if (c === '8') layer = v;
        else if (c === '10') x1 = parseFloat(v);
        else if (c === '20') y1 = parseFloat(v);
        else if (c === '11') x2 = parseFloat(v);
        else if (c === '21') y2 = parseFloat(v);
        i += 2;
      }

      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        const isCrease = isCreaseLayer(layer);
        segments.push({
          type: isCrease ? 'crease' : 'cut',
          a: [x1, y1],
          b: [x2, y2],
        });
      }
      continue;
    }

    if (code === '0' && val === 'LWPOLYLINE') {
      i += 2;
      let layer = '0';
      let isClosed = false;
      const pts: Pt[] = [];

      let curX: number | null = null;
      let curY: number | null = null;

      while (i < n - 1 && lines[i] !== '0') {
        const c = lines[i];
        const v = lines[i + 1];
        if (c === '8') layer = v;
        else if (c === '70') isClosed = (parseInt(v, 10) & 1) === 1;
        else if (c === '10') {
          if (curX !== null && curY !== null) {
            pts.push([curX, curY]);
            curY = null;
          }
          curX = parseFloat(v);
        } else if (c === '20') {
          curY = parseFloat(v);
        }
        i += 2;
      }
      if (curX !== null && curY !== null) {
        pts.push([curX, curY]);
      }

      const isCrease = isCreaseLayer(layer);
      for (let pIdx = 0; pIdx < pts.length - 1; pIdx++) {
        segments.push({
          type: isCrease ? 'crease' : 'cut',
          a: pts[pIdx],
          b: pts[pIdx + 1],
        });
      }
      if (isClosed && pts.length > 2) {
        segments.push({
          type: isCrease ? 'crease' : 'cut',
          a: pts[pts.length - 1],
          b: pts[0],
        });
      }
      continue;
    }

    if (code === '0' && val === 'ARC') {
      i += 2;
      let layer = '0';
      let cx = 0, cy = 0, r = 0, startA = 0, endA = 0;

      while (i < n - 1 && lines[i] !== '0') {
        const c = lines[i];
        const v = lines[i + 1];
        if (c === '8') layer = v;
        else if (c === '10') cx = parseFloat(v);
        else if (c === '20') cy = parseFloat(v);
        else if (c === '40') r = parseFloat(v);
        else if (c === '50') startA = (parseFloat(v) * Math.PI) / 180;
        else if (c === '51') endA = (parseFloat(v) * Math.PI) / 180;
        i += 2;
      }

      if (r > 0) {
        if (endA < startA) endA += Math.PI * 2;
        const steps = Math.max(4, Math.round(((endA - startA) / (Math.PI * 2)) * 16));
        const isCrease = isCreaseLayer(layer);
        for (let s = 0; s < steps; s++) {
          const a1 = startA + ((endA - startA) * s) / steps;
          const a2 = startA + ((endA - startA) * (s + 1)) / steps;
          segments.push({
            type: isCrease ? 'crease' : 'cut',
            a: [cx + r * Math.cos(a1), cy + r * Math.sin(a1)],
            b: [cx + r * Math.cos(a2), cy + r * Math.sin(a2)],
          });
        }
      }
      continue;
    }

    i += 2;
  }

  // Tính bbox
  if (segments.length === 0) {
    return { segments: [], bbox: [0, 0, 0, 0] };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const s of segments) {
    minX = Math.min(minX, s.a[0], s.b[0]);
    minY = Math.min(minY, s.a[1], s.b[1]);
    maxX = Math.max(maxX, s.a[0], s.b[0]);
    maxY = Math.max(maxY, s.a[1], s.b[1]);
  }

  return {
    segments,
    bbox: [minX, minY, maxX - minX, maxY - minY],
  };
}

function isCreaseLayer(layerName: string): boolean {
  const upper = layerName.toUpperCase();
  return (
    upper.includes('CREASE') ||
    upper.includes('FOLD') ||
    upper.includes('SCORE') ||
    upper.includes('BEND') ||
    upper.includes('CAN') ||
    upper.includes('CẤN') ||
    upper.includes('GAP')
  );
}
