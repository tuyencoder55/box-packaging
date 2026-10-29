// Kiểm thử quy đổi kích thước và bù độ dày trong src/core/thickness.ts
import { describe, expect, it } from 'vitest';
import { calcEffectiveParams, innerToOuter, outerToInner, thick } from './thickness';

describe('thickness', () => {
  it('outerToInner giảm mỗi chiều đi 2 * t', () => {
    const outer = { l: 300, w: 200, h: 150 };
    const t = 3;
    const inner = outerToInner(outer, t);

    expect(inner).toEqual({ l: 294, w: 194, h: 144 });
  });

  it('innerToOuter tăng mỗi chiều thêm 2 * t', () => {
    const inner = { l: 294, w: 194, h: 144 };
    const t = 3;
    const outer = innerToOuter(inner, t);

    expect(outer).toEqual({ l: 300, w: 200, h: 150 });
  });

  it('calcEffectiveParams chuyển đúng kích thước lòng cho BoxDef', () => {
    const paramsOuter = calcEffectiveParams({
      l: 300,
      w: 200,
      h: 150,
      t: 3,
      sizeType: 'outer',
      compensate: false,
      opts: {},
    });
    expect(paramsOuter.l).toBe(294);
    expect(paramsOuter.w).toBe(194);
    expect(paramsOuter.h).toBe(144);

    const paramsInner = calcEffectiveParams({
      l: 300,
      w: 200,
      h: 150,
      t: 3,
      sizeType: 'inner',
      compensate: true,
      opts: {},
    });
    expect(paramsInner.l).toBe(300);
    expect(paramsInner.opts.compensate).toBe(true);
  });

  it('thick chỉ cộng thêm t khi enabled là true', () => {
    expect(thick(100, 3, false)).toBe(100);
    expect(thick(100, 3, true)).toBe(103);
  });
});
