// Kiểm thử biến đổi hướng khuôn trong src/core/orient.ts
import { describe, expect, it } from 'vitest';
import { transformDieline } from './orient';
import type { Dieline } from './types';

describe('orient', () => {
  const baseDieline: Dieline = {
    cut: [{ a: [0, 0], b: [100, 50] }],
    crease: [{ a: [0, 25], b: [100, 25] }],
    polys: [
      [
        [0, 0],
        [100, 0],
        [100, 50],
        [0, 50],
      ],
    ],
    bbox: [0, 0, 100, 50],
  };

  it('normal giữ nguyên toạ độ', () => {
    const res = transformDieline(baseDieline, 'normal');
    expect(res).toBe(baseDieline);
  });

  it('flipH lật đối xứng trục ngang x quanh tâm cx = 50', () => {
    const res = transformDieline(baseDieline, 'flipH');
    // Điểm [0, 0] thành [2*50 - 0, 0] = [100, 0]
    expect(res.cut[0].a).toEqual([100, 0]);
    expect(res.cut[0].b).toEqual([0, 50]);
  });

  it('flipV lật đối xứng trục dọc y quanh tâm cy = 25', () => {
    const res = transformDieline(baseDieline, 'flipV');
    // Điểm [0, 0] thành [0, 2*25 - 0] = [0, 50]
    expect(res.cut[0].a).toEqual([0, 50]);
    expect(res.cut[0].b).toEqual([100, 0]);
  });

  it('rot180 xoay 180 độ quanh tâm (50, 25)', () => {
    const res = transformDieline(baseDieline, 'rot180');
    // Điểm [0, 0] thành [100, 50]
    expect(res.cut[0].a).toEqual([100, 50]);
    expect(res.cut[0].b).toEqual([0, 0]);
  });

  it('lật 2 lần flipH trở về toạ độ gốc ban đầu', () => {
    const step1 = transformDieline(baseDieline, 'flipH');
    const step2 = transformDieline(step1, 'flipH');
    expect(step2.cut[0]).toEqual(baseDieline.cut[0]);
  });
});
