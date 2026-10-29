// Danh sách đăng ký các loại hộp (BoxDef Registry)
import { fefco0201 } from './fefco-0201';
import type { BoxDef } from '../core/types';

export const BOX_REGISTRY: Record<string, BoxDef> = {
  'fefco-0201': fefco0201,
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

