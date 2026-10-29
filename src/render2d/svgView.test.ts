// Kiểm thử hàm sinh dữ liệu SVG khuôn trong src/render2d/svgView.ts
import { describe, expect, it } from 'vitest';
import { dielineToSvgData, segsToPathData } from './svgView';
import type { Dieline, Seg } from '../core/types';

describe('svgView', () => {
  it('segsToPathData chuyển đổi các đoạn thẳng thành chuỗi path SVG hợp lệ', () => {
    const segs: Seg[] = [
      { a: [0, 0], b: [100, 0] },
      { a: [100, 0], b: [100, 50] },
    ];
    const path = segsToPathData(segs);
    expect(path).toBe('M 0 0 L 100 0 M 100 0 L 100 50');
  });

  it('dielineToSvgData tính đúng viewBox kèm lề padding', () => {
    const dieline: Dieline = {
      cut: [{ a: [0, 0], b: [100, 50] }],
      crease: [{ a: [0, 25], b: [100, 25] }],
      polys: [],
      bbox: [10, 20, 100, 50],
    };

    const data = dielineToSvgData(dieline, 15);
    // vx = 10 - 15 = -5, vy = 20 - 15 = 5, vw = 100 + 30 = 130, vh = 50 + 30 = 80
    expect(data.viewBox).toBe('-5 5 130 80');
    expect(data.cutPath).toBe('M 0 0 L 100 50');
    expect(data.creasePath).toBe('M 0 25 L 100 25');
  });
});
