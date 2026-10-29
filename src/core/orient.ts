// Biến đổi hướng hiển thị khuôn: Chuẩn / Lật ngang / Lật dọc / Xoay 180°
import { round3 } from './units';
import type { Dieline, Pt, Seg } from './types';

export type Orient = 'normal' | 'flipH' | 'flipV' | 'rot180';

function transformPt(p: Pt, orient: Orient, cx: number, cy: number): Pt {
  switch (orient) {
    case 'normal':
      return [p[0], p[1]];
    case 'flipH':
      return [round3(2 * cx - p[0]), p[1]];
    case 'flipV':
      return [p[0], round3(2 * cy - p[1])];
    case 'rot180':
      return [round3(2 * cx - p[0]), round3(2 * cy - p[1])];
  }
}

function transformSeg(s: Seg, orient: Orient, cx: number, cy: number): Seg {
  return {
    a: transformPt(s.a, orient, cx, cy),
    b: transformPt(s.b, orient, cx, cy),
  };
}

/**
 * Biến đổi toạ độ Dieline theo hướng hiển thị đã chọn quanh tâm của hộp bao (bbox)
 */
export function transformDieline(dieline: Dieline, orient: Orient): Dieline {
  if (orient === 'normal') return dieline;

  const [minX, minY, w, h] = dieline.bbox;
  const cx = minX + w / 2;
  const cy = minY + h / 2;

  const cut = dieline.cut.map((s) => transformSeg(s, orient, cx, cy));
  const crease = dieline.crease.map((s) => transformSeg(s, orient, cx, cy));
  const polys = dieline.polys.map((poly) =>
    poly.map((p) => transformPt(p, orient, cx, cy))
  );

  return {
    cut,
    crease,
    polys,
    bbox: dieline.bbox,
  };
}
