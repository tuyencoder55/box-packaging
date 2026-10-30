// Thuật toán co dãn khuôn bế thông minh (Smart Parametric Slicing & Rescaling)
import type { Dieline, Pt, Seg } from '../core/types';
import type { DetectedBoxStructure, ImportedDieline, RawSegment } from './types';

/**
 * Tự động phân tích các đường cấn và đường cắt để phát hiện cấu trúc hộp (L0, W0, H0, glueWidth)
 */
export function autoDetectStructure(
  segments: RawSegment[],
  bbox: [number, number, number, number]
): DetectedBoxStructure {
  const [minX, minY, totalW, totalH] = bbox;

  // Lọc các đường cấn thẳng đứng và nằm ngang kèm độ dài
  const vCreases: { x: number; len: number }[] = [];
  const hCreases: { y: number; len: number }[] = [];

  for (const s of segments) {
    if (s.type === 'crease') {
      const dx = Math.abs(s.b[0] - s.a[0]);
      const dy = Math.abs(s.b[1] - s.a[1]);

      if (dx < 1.0 && dy > 8) {
        // Cấn dọc
        vCreases.push({ x: (s.a[0] + s.b[0]) / 2, len: dy });
      } else if (dy < 1.0 && dx > 8) {
        // Cấn ngang
        hCreases.push({ y: (s.a[1] + s.b[1]) / 2, len: dx });
      }
    }
  }

  // Nhóm các toạ độ x của đường cấn dọc
  const xClusters = clusterNumbers(vCreases.map((c) => c.x), 3.0);
  xClusters.sort((a, b) => a - b);

  let xGlueEnd = minX + 15;
  let l0 = 80;
  let w0 = 50;
  let h0 = 140;
  let yTop = minY + 50;
  let yBottom = yTop + h0;

  // Nếu tìm thấy ít nhất 4 đường cấn dọc chuẩn của hộp 4 mặt (Glue -> Col1 -> Col2 -> Col3 -> Col4)
  if (xClusters.length >= 4) {
    xGlueEnd = xClusters[0];
    const col1W = xClusters[1] - xClusters[0];
    const col2W = xClusters[2] - xClusters[1];
    l0 = Math.round(col1W * 10) / 10;
    w0 = Math.round(col2W * 10) / 10;
  } else {
    const availableW = totalW - 15;
    l0 = Math.round(availableW * 0.31 * 10) / 10;
    w0 = Math.round(availableW * 0.19 * 10) / 10;
    xGlueEnd = minX + 15;
  }

  // Nhận diện đường cấn nắp trên và đáy:
  // Gom các đường cấn ngang theo toạ độ y và cộng dồn chiều dài
  const hCreaseByY = new Map<number, number>();
  for (const c of hCreases) {
    // Gom trong bán kính 2mm
    let matchedKey: number | null = null;
    for (const k of hCreaseByY.keys()) {
      if (Math.abs(k - c.y) <= 2.0) {
        matchedKey = k;
        break;
      }
    }
    if (matchedKey !== null) {
      hCreaseByY.set(matchedKey, hCreaseByY.get(matchedKey)! + c.len);
    } else {
      hCreaseByY.set(Math.round(c.y), c.len);
    }
  }

  // Lấy 2 đường cấn ngang có tổng chiều dài trải rộng nhất (2 đường ranh giới nắp trên và đáy hộp)
  const sortedHByLen = Array.from(hCreaseByY.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedHByLen.length >= 2) {
    const y1 = sortedHByLen[0][0];
    const y2 = sortedHByLen[1][0];
    yTop = Math.min(y1, y2);
    yBottom = Math.max(y1, y2);
    h0 = Math.round((yBottom - yTop) * 10) / 10;
  } else {
    yTop = minY + Math.round(totalH * 0.22);
    yBottom = minY + Math.round(totalH * 0.78);
    h0 = Math.round((yBottom - yTop) * 10) / 10;
  }

  const glueWidth = Math.max(8, Math.round((xGlueEnd - minX) * 10) / 10);
  const xCol1End = xGlueEnd + l0;
  const xCol2End = xCol1End + w0;
  const xCol3End = xCol2End + l0;
  const maxX = minX + totalW;
  const maxY = minY + totalH;

  const topFlapH = yTop - minY;
  const bottomFlapH = maxY - yBottom;
  // Nhận diện nếu là thùng nắp đối khẩu (RSC / FEFCO 0201) khi chiều cao nắp ~ W0 / 2
  const isRSCFlap =
    w0 > 0 &&
    topFlapH > 10 &&
    bottomFlapH > 10 &&
    Math.abs(topFlapH - w0 / 2) <= 12 &&
    Math.abs(bottomFlapH - w0 / 2) <= 12;

  return {
    l0,
    w0,
    h0,
    glueWidth,
    yTop,
    yBottom,
    xGlueEnd,
    xCol1End,
    xCol2End,
    xCol3End,
    minX,
    minY,
    maxX,
    maxY,
    isRSCFlap,
  };
}

/**
 * Biến đổi toạ độ x của một điểm dựa trên phân vùng cấu trúc hộp
 */
export function mapX(x: number, s: DetectedBoxStructure, targetL: number, targetW: number): number {
  const { xGlueEnd, xCol1End, xCol2End, xCol3End, l0, w0 } = s;

  if (x <= xGlueEnd) {
    // Vùng lưỡi dán: giữ nguyên kích thước và góc vát
    return x;
  }
  if (x <= xCol1End) {
    // Cột 1 (L): dãn theo targetL
    const ratio = (x - xGlueEnd) / l0;
    return xGlueEnd + ratio * targetL;
  }
  if (x <= xCol2End) {
    // Cột 2 (W): dãn theo targetW
    const ratio = (x - xCol1End) / w0;
    return xGlueEnd + targetL + ratio * targetW;
  }
  if (x <= xCol3End) {
    // Cột 3 (L): dãn theo targetL
    const ratio = (x - xCol2End) / l0;
    return xGlueEnd + targetL + targetW + ratio * targetL;
  }
  // Cột 4 (W): dãn theo targetW
  const ratio = (x - xCol3End) / w0;
  return xGlueEnd + 2 * targetL + targetW + ratio * targetW;
}

/**
 * Biến đổi toạ độ y của một điểm dựa trên phân vùng cấu trúc hộp
 */
export function mapY(y: number, s: DetectedBoxStructure, targetH: number, targetW?: number): number {
  const { yTop, yBottom, h0, minY, maxY, isRSCFlap, w0 } = s;

  if (y <= yTop) {
    if (isRSCFlap && targetW !== undefined && targetW > 0 && w0 > 0) {
      // Thùng nắp đối khẩu FEFCO 0201: chiều cao nắp trên = targetW / 2
      const origFlapH = Math.max(1, yTop - minY);
      const targetFlapH = targetW / 2;
      const ratio = (yTop - y) / origFlapH;
      return yTop - ratio * targetFlapH;
    }
    // Hộp gài nắp: giữ nguyên 100% hình học nắp & tai gài
    return y;
  }

  if (y <= yBottom) {
    // Vùng thân hộp: dãn theo chiều cao targetH
    const ratio = (y - yTop) / h0;
    return yTop + ratio * targetH;
  }

  // Vùng đáy hộp
  const deltaH = targetH - h0;
  if (isRSCFlap && targetW !== undefined && targetW > 0 && w0 > 0) {
    // Thùng nắp đối khẩu FEFCO 0201: chiều cao nắp đáy = targetW / 2
    const origFlapH = Math.max(1, maxY - yBottom);
    const targetFlapH = targetW / 2;
    const ratio = (y - yBottom) / origFlapH;
    return yTop + targetH + ratio * targetFlapH;
  }

  // Hộp gài nắp / đáy khoá: tịnh tiến toàn bộ hệ thống đáy khoá xuống dưới
  return y + deltaH;
}

/**
 * Co giãn toàn bộ khuôn bế đã nạp theo kích thước mới (targetL, targetW, targetH)
 */
export function rescaleDieline(
  imported: ImportedDieline,
  targetL: number,
  targetW: number,
  targetH: number
): Dieline {
  const s = imported.structure;
  const cutSegs: Seg[] = [];
  const creaseSegs: Seg[] = [];

  for (const seg of imported.segments) {
    const aNew: Pt = [mapX(seg.a[0], s, targetL, targetW), mapY(seg.a[1], s, targetH, targetW)];
    const bNew: Pt = [mapX(seg.b[0], s, targetL, targetW), mapY(seg.b[1], s, targetH, targetW)];

    const resSeg: Seg = { a: aNew, b: bNew };
    if (seg.type === 'crease') {
      creaseSegs.push(resSeg);
    } else {
      cutSegs.push(resSeg);
    }
  }

  // Tính lại bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const seg of [...cutSegs, ...creaseSegs]) {
    minX = Math.min(minX, seg.a[0], seg.b[0]);
    minY = Math.min(minY, seg.a[1], seg.b[1]);
    maxX = Math.max(maxX, seg.a[0], seg.b[0]);
    maxY = Math.max(maxY, seg.a[1], seg.b[1]);
  }

  return {
    cut: cutSegs,
    crease: creaseSegs,
    polys: [],
    bbox: [minX, minY, maxX - minX, maxY - minY],
  };
}

function clusterNumbers(nums: number[], tolerance: number): number[] {
  if (nums.length === 0) return [];
  const sorted = [...nums].sort((a, b) => a - b);
  const clusters: number[] = [];

  let curGroup: number[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const val = sorted[i];
    if (val - curGroup[curGroup.length - 1] <= tolerance) {
      curGroup.push(val);
    } else {
      const avg = curGroup.reduce((a, b) => a + b, 0) / curGroup.length;
      clusters.push(Math.round(avg * 10) / 10);
      curGroup = [val];
    }
  }

  if (curGroup.length > 0) {
    const avg = curGroup.reduce((a, b) => a + b, 0) / curGroup.length;
    clusters.push(Math.round(avg * 10) / 10);
  }

  return clusters;
}
