// Tính toán bù độ dày giấy (t) và quy đổi kích thước lòng ↔ phủ bì
import type { BoxParams } from './types';

export interface RawBoxInput {
  l: number;
  w: number;
  h: number;
  t: number;
  sizeType: 'inner' | 'outer';
  compensate: boolean;
  opts: Record<string, string | boolean | number>;
}

/**
 * Quy đổi từ phủ bì sang lòng: lòng = phủ bì - 2 * t
 */
export function outerToInner(
  dim: { l: number; w: number; h: number },
  t: number
): { l: number; w: number; h: number } {
  return {
    l: Math.max(1, dim.l - 2 * t),
    w: Math.max(1, dim.w - 2 * t),
    h: Math.max(1, dim.h - 2 * t),
  };
}

/**
 * Quy đổi từ lòng sang phủ bì: phủ bì = lòng + 2 * t
 */
export function innerToOuter(
  dim: { l: number; w: number; h: number },
  t: number
): { l: number; w: number; h: number } {
  return {
    l: dim.l + 2 * t,
    w: dim.w + 2 * t,
    h: dim.h + 2 * t,
  };
}

/**
 * Bù độ dày v1 cho panel thân nằm giữa 2 nếp cấn song song
 */
export function thick(baseVal: number, t: number, enabled: boolean): number {
  return enabled ? baseVal + t : baseVal;
}

/**
 * Tính toán BoxParams chuẩn (kích thước lòng, mm) để chuyển cho BoxDef.build()
 */
export function calcEffectiveParams(input: RawBoxInput): BoxParams {
  const inner =
    input.sizeType === 'outer'
      ? outerToInner({ l: input.l, w: input.w, h: input.h }, input.t)
      : { l: input.l, w: input.w, h: input.h };

  return {
    l: inner.l,
    w: inner.w,
    h: inner.h,
    t: input.t,
    opts: {
      ...input.opts,
      compensate: input.compensate,
    },
  };
}
