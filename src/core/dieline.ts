// Phân loại đường cắt (cut) và cấn (crease), tính hộp bao (bbox) từ LayoutPanel[]
import { round3 } from './units';
import type { Dieline, Pt, Seg } from './types';
import type { LayoutPanel } from './layout';

function distSq(p1: Pt, p2: Pt): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function segKey(a: Pt, b: Pt): string {
  const ka = `${round3(a[0])},${round3(a[1])}`;
  const kb = `${round3(b[0])},${round3(b[1])}`;
  return ka < kb ? `${ka}_${kb}` : `${kb}_${ka}`;
}

/**
 * Chiếu điểm P lên đoạn thẳng AB, trả về tham số t (0..1) và khoảng cách vuông góc
 */
function projectToSeg(p: Pt, a: Pt, b: Pt): { t: number; dist: number } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) {
    return { t: 0, dist: Math.sqrt(distSq(p, a)) };
  }

  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
  const projX = a[0] + t * dx;
  const projY = a[1] + t * dy;
  const dist = Math.sqrt(distSq(p, [projX, projY]));
  return { t, dist };
}

/**
 * Trừ các khoảng che phủ [t1, t2] khỏi đoạn [0, 1]
 */
function subtractIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [[0, 1]];

  // Chuẩn hoá và sắp xếp
  const sorted = intervals
    .map(([s, e]) => (s < e ? [s, e] : [e, s]) as [number, number])
    .filter(([s, e]) => e > 0 && s < 1)
    .map(([s, e]) => [Math.max(0, s), Math.min(1, e)] as [number, number])
    .sort((i1, i2) => i1[0] - i2[0]);

  // Hợp các khoảng trùng
  const merged: [number, number][] = [];
  for (const iv of sorted) {
    if (merged.length === 0) {
      merged.push(iv);
    } else {
      const last = merged[merged.length - 1];
      if (iv[0] <= last[1] + 1e-5) {
        last[1] = Math.max(last[1], iv[1]);
      } else {
        merged.push(iv);
      }
    }
  }

  // Lấy phần bù trong [0, 1]
  const rem: [number, number][] = [];
  let curr = 0;
  for (const [s, e] of merged) {
    if (s > curr + 1e-5) {
      rem.push([curr, s]);
    }
    curr = Math.max(curr, e);
  }
  if (curr < 1 - 1e-5) {
    rem.push([curr, 1]);
  }

  return rem;
}

/**
 * Tạo đối tượng Dieline từ danh sách LayoutPanel
 */
export function buildDieline(layouts: LayoutPanel[]): Dieline {
  const crease: Seg[] = [];
  const allBaseSegs: Seg[] = [];

  for (const layout of layouts) {
    if (layout.baseSeg) {
      crease.push(layout.baseSeg);
      allBaseSegs.push(layout.baseSeg);
    }
  }

  const rawCuts: Seg[] = [];

  for (const layout of layouts) {
    const poly = layout.poly;
    const n = poly.length;

    for (let i = 0; i < n; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % n];
      const edgeLen = Math.sqrt(distSq(a, b));
      if (edgeLen < 1e-4) continue;

      // Tìm tất cả các baseSeg nằm trùng lên cạnh (a, b) này
      const coveredIntervals: [number, number][] = [];

      for (const bs of allBaseSegs) {
        const p1 = projectToSeg(bs.a, a, b);
        const p2 = projectToSeg(bs.b, a, b);

        // Nếu cả hai đầu mút của baseSeg đều nằm trên đường thẳng chứa (a, b)
        if (p1.dist < 0.05 && p2.dist < 0.05) {
          // Kiểm tra xem đoạn này có giao với [0, 1] không
          const minT = Math.min(p1.t, p2.t);
          const maxT = Math.max(p1.t, p2.t);
          if (maxT > 1e-4 && minT < 1 - 1e-4) {
            coveredIntervals.push([minT, maxT]);
          }
        }
      }

      // Trừ các khoảng cấn khỏi cạnh
      const freeIntervals = subtractIntervals(coveredIntervals);
      for (const [t0, t1] of freeIntervals) {
        if ((t1 - t0) * edgeLen > 0.05) {
          rawCuts.push({
            a: [a[0] + t0 * (b[0] - a[0]), a[1] + t0 * (b[1] - a[1])],
            b: [a[0] + t1 * (b[0] - a[0]), a[1] + t1 * (b[1] - a[1])],
          });
        }
      }
    }
  }

  // Khử trùng lặp các đoạn cắt
  const cut: Seg[] = [];
  const seenCutKeys = new Set<string>();
  for (const seg of rawCuts) {
    const k = segKey(seg.a, seg.b);
    if (!seenCutKeys.has(k)) {
      seenCutKeys.add(k);
      cut.push(seg);
    }
  }

  // Tính bbox toàn bộ
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const layout of layouts) {
    for (const [x, y] of layout.poly) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (minX === Infinity) {
    minX = minY = maxX = maxY = 0;
  }

  const bbox: [number, number, number, number] = [
    round3(minX),
    round3(minY),
    round3(maxX - minX),
    round3(maxY - minY),
  ];

  return {
    cut,
    crease,
    polys: layouts.map((l) => l.poly),
    bbox,
  };
}

