import { describe, expect, it } from 'vitest';
import { calcPolylineLength, chainSegments } from './chain';
import type { Seg } from './types';

describe('core/chain', () => {
  it('nối 4 đoạn của hình vuông thành 1 polyline khép kín 4 điểm', () => {
    // 4 đoạn hình vuông cạnh 50, xáo trộn thứ tự
    const segs: Seg[] = [
      { a: [50, 0], b: [50, 50] },
      { a: [0, 50], b: [0, 0] },
      { a: [50, 50], b: [0, 50] },
      { a: [0, 0], b: [50, 0] },
    ];

    const lines = chainSegments(segs);

    expect(lines.length).toBe(1);
    expect(lines[0].closed).toBe(true);
    expect(lines[0].pts.length).toBe(4);

    // Chu vi hình vuông 50x50 = 200
    const len = calcPolylineLength(lines);
    expect(len).toBeCloseTo(200, 3);
  });

  it('xử lý ngã ba chữ T: không nối xuyên qua điểm giao nhau', () => {
    const segs: Seg[] = [
      { a: [0, 0], b: [50, 0] },
      { a: [50, 0], b: [100, 0] },
      { a: [50, 0], b: [50, 50] }, // nhánh chữ T
    ];

    const lines = chainSegments(segs);

    // Không có đường nào khép kín
    expect(lines.every((l) => !l.closed)).toBe(true);

    // Bảo toàn tổng độ dài: 50 + 50 + 50 = 150
    const len = calcPolylineLength(lines);
    expect(len).toBeCloseTo(150, 3);
  });

  it('bảo toàn tổng chiều dài cho danh sách đoạn phức tạp', () => {
    const segs: Seg[] = [
      { a: [10, 10], b: [30, 10] },
      { a: [30, 10], b: [30, 40] },
      { a: [30, 40], b: [60, 40] },
      { a: [100, 100], b: [120, 100] }, // đoạn rời độc lập
    ];

    const originalLength =
      20 + // [10,10]->[30,10]
      30 + // [30,10]->[30,40]
      30 + // [30,40]->[60,40]
      20; // [100,100]->[120,100]

    const lines = chainSegments(segs);
    const chainedLength = calcPolylineLength(lines);

    expect(chainedLength).toBeCloseTo(originalLength, 3);
  });
});
