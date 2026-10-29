// Danh sách đăng ký các loại hộp (BoxDef Registry)
import { autoLockBottom } from './auto-lock-bottom';
import { fefco0201 } from './fefco-0201';
import { fefco0203 } from './fefco-0203';
import { fefco0301 } from './fefco-0301';
import { fefco0427 } from './fefco-0427';
import { tuckEndReverse } from './tuck-end-reverse';
import { tuckEndStraight } from './tuck-end-straight';
import type { BoxDef } from '../core/types';

export const BOX_REGISTRY: Record<string, BoxDef> = {
  'fefco-0201': fefco0201,
  'fefco-0203': fefco0203,
  'fefco-0301': fefco0301,
  'fefco-0427': fefco0427,
  'tuck-end-straight': tuckEndStraight,
  'tuck-end-reverse': tuckEndReverse,
  'auto-lock-bottom': autoLockBottom,
};

/**
 * Lấy BoxDef theo id
 */
export function getBoxDef(id: string): BoxDef | undefined {
  return BOX_REGISTRY[id];
}

/**
 * Lấy danh sách tất cả các loại hộp đã đăng ký
 */
export function getAllBoxes(): BoxDef[] {
  return Object.values(BOX_REGISTRY);
}
