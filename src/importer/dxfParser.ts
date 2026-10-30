// Bộ phân tích file DXF (AutoCAD R12/2000+) thành các đoạn thẳng Cut và Crease
// Hỗ trợ tự động lọc bỏ layer kích thước (DIMENSION), chữ chú thích (TEXT), khung tên, và chuẩn hoá hệ toạ độ Y-up sang Y-down
import type { Pt } from '../core/types';
import type { RawSegment } from './types';

/**
 * Kiểm tra xem layer có phải là layer phi hình học (kích thước, chú thích, khung tên, v.v.) không
 */
export function isIgnoredLayer(layerName: string): boolean {
  const upper = layerName.toUpperCase().trim();
  return (
    upper.includes('DIM') ||
    upper.includes('KICHTHUOC') ||
    upper.includes('KÍCH THƯỚC') ||
    upper.includes('DEFPOINTS') ||
    upper.includes('TEXT') ||
    upper.includes('MTEXT') ||
    upper.includes('NOTE') ||
    upper.includes('CHUTHICH') ||
    upper.includes('CHÚ THÍCH') ||
    upper.includes('GHICHU') ||
    upper.includes('GHI CHÚ') ||
    upper.includes('ANNO') ||
    upper.includes('FRAME') ||
    upper.includes('KHUNG') ||
    upper.includes('BORDER') ||
    upper.includes('TITLE') ||
    upper.includes('LOGO') ||
    upper.includes('CENTER') ||
    upper.includes('TRUC') ||
    upper.includes('HATCH') ||
    upper.includes('BIA') ||
    upper.includes('GUIDE') ||
    upper.includes('VIEWPORT')
  );
}

/**
 * Phân loại đoạn thẳng là đường cấn (crease) dựa trên tên layer, kiểu nét (linetype), hoặc mã màu CAD
 */
export function isCreaseEntity(layerName: string, linetype?: string, colorNum?: number): boolean {
  const upperLayer = layerName.toUpperCase().trim();
  if (
    upperLayer.includes('CREASE') ||
    upperLayer.includes('FOLD') ||
    upperLayer.includes('SCORE') ||
    upperLayer.includes('CAN') ||
    upperLayer.includes('CẤN') ||
    upperLayer.includes('GAP') ||
    upperLayer.includes('GẬP') ||
    upperLayer.includes('BEND') ||
    upperLayer.includes('PERF')
  ) {
    return true;
  }
  if (linetype) {
    const upperLt = linetype.toUpperCase();
    if (upperLt.includes('DASH') || upperLt.includes('HIDDEN') || upperLt.includes('DOT') || upperLt.includes('SCORE')) {
      return true;
    }
  }
  // Màu 5 (Blue) hoặc 4 (Cyan) trong chuẩn vẽ CAD bao bì là nếp cấn (crease)
  if (colorNum === 5 || colorNum === 4) {
    return true;
  }
  return false;
}

export function parseDxfString(dxfContent: string): { segments: RawSegment[]; bbox: [number, number, number, number] } {
  const lines = dxfContent.split(/\r?\n/).map((l) => l.trim());
  const rawSegments: RawSegment[] = [];

  let i = 0;
  const n = lines.length;

  while (i < n - 1) {
    const code = lines[i];
    const val = lines[i + 1];

    // Bỏ qua các đối tượng phi hình học (DIMENSION, TEXT, MTEXT, HATCH, LEADER)
    if (
      code === '0' &&
      (val === 'DIMENSION' ||
        val === 'TEXT' ||
        val === 'MTEXT' ||
        val === 'HATCH' ||
        val === 'LEADER' ||
        val === 'MULTILEADER' ||
        val === 'VIEWPORT')
    ) {
      i += 2;
      while (i < n - 1 && lines[i] !== '0') {
        i += 2;
      }
      continue;
    }

    // 1. LINE
    if (code === '0' && val === 'LINE') {
      i += 2;
      let layer = '0';
      let linetype = '';
      let colorNum: number | undefined;
      let x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0;

      while (i < n - 1 && lines[i] !== '0') {
        const c = lines[i];
        const v = lines[i + 1];
        if (c === '8') layer = v;
        else if (c === '6') linetype = v;
        else if (c === '62') colorNum = parseInt(v, 10);
        else if (c === '10') x1 = parseFloat(v);
        else if (c === '20') y1 = parseFloat(v);
        else if (c === '11') x2 = parseFloat(v);
        else if (c === '21') y2 = parseFloat(v);
        i += 2;
      }

      if (!isIgnoredLayer(layer) && !isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        const isCrease = isCreaseEntity(layer, linetype, colorNum);
        rawSegments.push({
          type: isCrease ? 'crease' : 'cut',
          a: [x1, y1],
          b: [x2, y2],
        });
      }
      continue;
    }

    // 2. LWPOLYLINE
    if (code === '0' && val === 'LWPOLYLINE') {
      i += 2;
      let layer = '0';
      let linetype = '';
      let colorNum: number | undefined;
      let isClosed = false;
      const pts: Pt[] = [];

      let curX: number | null = null;
      let curY: number | null = null;

      while (i < n - 1 && lines[i] !== '0') {
        const c = lines[i];
        const v = lines[i + 1];
        if (c === '8') layer = v;
        else if (c === '6') linetype = v;
        else if (c === '62') colorNum = parseInt(v, 10);
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

      if (!isIgnoredLayer(layer) && pts.length >= 2) {
        const isCrease = isCreaseEntity(layer, linetype, colorNum);
        const segType = isCrease ? 'crease' : 'cut';

        for (let pIdx = 0; pIdx < pts.length - 1; pIdx++) {
          rawSegments.push({
            type: segType,
            a: pts[pIdx],
            b: pts[pIdx + 1],
          });
        }
        if (isClosed && pts.length > 2) {
          rawSegments.push({
            type: segType,
            a: pts[pts.length - 1],
            b: pts[0],
          });
        }
      }
      continue;
    }

    // 3. POLYLINE (AutoCAD R12 với VERTEX con)
    if (code === '0' && val === 'POLYLINE') {
      i += 2;
      let layer = '0';
      let linetype = '';
      let colorNum: number | undefined;
      let isClosed = false;
      const pts: Pt[] = [];

      while (i < n - 1 && lines[i] !== '0') {
        const c = lines[i];
        const v = lines[i + 1];
        if (c === '8') layer = v;
        else if (c === '6') linetype = v;
        else if (c === '62') colorNum = parseInt(v, 10);
        else if (c === '70') isClosed = (parseInt(v, 10) & 1) === 1;
        i += 2;
      }

      // Đọc các đỉnh VERTEX cho đến SEQEND
      while (i < n - 1) {
        if (lines[i] === '0' && lines[i + 1] === 'VERTEX') {
          i += 2;
          let vx = 0,
            vy = 0;
          while (i < n - 1 && lines[i] !== '0') {
            if (lines[i] === '10') vx = parseFloat(lines[i + 1]);
            else if (lines[i] === '20') vy = parseFloat(lines[i + 1]);
            i += 2;
          }
          pts.push([vx, vy]);
        } else if (lines[i] === '0' && (lines[i + 1] === 'SEQEND' || lines[i + 1] === 'ENDSEC')) {
          i += 2;
          break;
        } else if (lines[i] === '0') {
          break;
        } else {
          i += 2;
        }
      }

      if (!isIgnoredLayer(layer) && pts.length >= 2) {
        const isCrease = isCreaseEntity(layer, linetype, colorNum);
        const segType = isCrease ? 'crease' : 'cut';

        for (let pIdx = 0; pIdx < pts.length - 1; pIdx++) {
          rawSegments.push({ type: segType, a: pts[pIdx], b: pts[pIdx + 1] });
        }
        if (isClosed && pts.length > 2) {
          rawSegments.push({ type: segType, a: pts[pts.length - 1], b: pts[0] });
        }
      }
      continue;
    }

    // 4. ARC
    if (code === '0' && val === 'ARC') {
      i += 2;
      let layer = '0';
      let linetype = '';
      let colorNum: number | undefined;
      let cx = 0,
        cy = 0,
        r = 0,
        startA = 0,
        endA = 0;

      while (i < n - 1 && lines[i] !== '0') {
        const c = lines[i];
        const v = lines[i + 1];
        if (c === '8') layer = v;
        else if (c === '6') linetype = v;
        else if (c === '62') colorNum = parseInt(v, 10);
        else if (c === '10') cx = parseFloat(v);
        else if (c === '20') cy = parseFloat(v);
        else if (c === '40') r = parseFloat(v);
        else if (c === '50') startA = (parseFloat(v) * Math.PI) / 180;
        else if (c === '51') endA = (parseFloat(v) * Math.PI) / 180;
        i += 2;
      }

      if (!isIgnoredLayer(layer) && r > 0) {
        if (endA < startA) endA += Math.PI * 2;
        const steps = Math.max(4, Math.round(((endA - startA) / (Math.PI * 2)) * 16));
        const isCrease = isCreaseEntity(layer, linetype, colorNum);
        for (let s = 0; s < steps; s++) {
          const a1 = startA + ((endA - startA) * s) / steps;
          const a2 = startA + ((endA - startA) * (s + 1)) / steps;
          rawSegments.push({
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

  if (rawSegments.length === 0) {
    return { segments: [], bbox: [0, 0, 0, 0] };
  }

  // Tính bbox ban đầu trong không gian toạ độ CAD (Y-up)
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const s of rawSegments) {
    minX = Math.min(minX, s.a[0], s.b[0]);
    minY = Math.min(minY, s.a[1], s.b[1]);
    maxX = Math.max(maxX, s.a[0], s.b[0]);
    maxY = Math.max(maxY, s.a[1], s.b[1]);
  }

  // Chuẩn hoá toạ độ: Đảo trục Y (AutoCAD Cartesian Y-up -> SVG Screen Y-down)
  // Trong CAD: Y=maxY là đỉnh nắp trên, Y=minY là đáy dưới.
  // Trong SVG: Y=minY là đỉnh nắp trên, Y=maxY là đáy dưới.
  const segments: RawSegment[] = rawSegments.map((s) => ({
    type: s.type,
    a: [s.a[0], maxY + minY - s.a[1]],
    b: [s.b[0], maxY + minY - s.b[1]],
  }));

  return {
    segments,
    bbox: [minX, minY, maxX - minX, maxY - minY],
  };
}
