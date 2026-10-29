// Hàm tạo đa giác toạ độ cục bộ (u, v): u dọc cạnh gắn, v đi ra xa cạnh gắn
import type { Pt } from './types';

/**
 * Hình chữ nhật đơn giản len × depth
 */
export function rect(len: number, depth: number): Pt[] {
  return [
    [0, 0],
    [len, 0],
    [len, depth],
    [0, depth],
  ];
}

/**
 * Hình thang: cạnh gắn là len, cạnh xa bị thụt vào ở 2 bên
 */
export function trapezoid(
  len: number,
  depth: number,
  insetLeft = 0,
  insetRight = 0
): Pt[] {
  return [
    [0, 0],
    [len, 0],
    [len - insetRight, depth],
    [insetLeft, depth],
  ];
}

/**
 * Hình chữ nhật vát góc ở 2 đỉnh xa cạnh gắn (cLeft, cRight: chiều dài vát)
 */
export function chamfer(
  len: number,
  depth: number,
  cLeft = 0,
  cRight = 0
): Pt[] {
  const pts: Pt[] = [[0, 0], [len, 0]];

  if (cRight > 0) {
    pts.push([len, depth - cRight]);
    pts.push([len - cRight, depth]);
  } else {
    pts.push([len, depth]);
  }

  if (cLeft > 0) {
    pts.push([cLeft, depth]);
    pts.push([0, depth - cLeft]);
  } else {
    pts.push([0, depth]);
  }

  return pts;
}

/**
 * Hình chữ nhật bo tròn ở 2 góc xa cạnh gắn
 */
export function rounded(
  len: number,
  depth: number,
  rLeft = 0,
  rRight = 0,
  segments = 8
): Pt[] {
  const pts: Pt[] = [[0, 0], [len, 0]];

  // Bo góc xa bên phải
  if (rRight > 0) {
    const cx = len - rRight;
    const cy = depth - rRight;
    for (let i = 0; i <= segments; i++) {
      const angle = 0 + (Math.PI / 2) * (i / segments);
      pts.push([
        cx + rRight * Math.cos(angle),
        cy + rRight * Math.sin(angle),
      ]);
    }
  } else {
    pts.push([len, depth]);
  }

  // Bo góc xa bên trái
  if (rLeft > 0) {
    const cx = rLeft;
    const cy = depth - rLeft;
    for (let i = 0; i <= segments; i++) {
      const angle = Math.PI / 2 + (Math.PI / 2) * (i / segments);
      pts.push([
        cx + rLeft * Math.cos(angle),
        cy + rLeft * Math.sin(angle),
      ]);
    }
  } else {
    pts.push([0, depth]);
  }

  return pts;
}

