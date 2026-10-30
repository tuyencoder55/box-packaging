// Danh sách đăng ký các loại hộp (BoxDef Registry)
import { autoLockBottomBox } from './auto-lock-bottom';
import { crashLockHangTabBox } from './crash-lock-hang-tab';
import { tissueBox } from './cube-tissue-box';
import { dispenserBox } from './dispenser-box';
import { fefco0201 } from './fefco-0201';
import { fefco0203 } from './fefco-0203';
import { fefco0301 } from './fefco-0301';
import { fefco0427 } from './fefco-0427';
import { flatTissueBox } from './flat-tissue-box';
import { hangTabTuckEndBox } from './hang-tab-tuck-end';
import { sealEndCarton } from './seal-end-carton';
import { snapLockBottomBox } from './snap-lock-bottom';
import { snapLockHangTabBox } from './snap-lock-hang-tab';
import { teaBox } from './tea-bag-box';
import { reverseTuckEndBox } from './tuck-end-reverse';
import { straightTuckEndBox } from './tuck-end-straight';
import { tuckTopGluedBottomBox } from './tuck-top-glued-bottom';
import { windowTuckEnd } from './window-tuck-end';
import type { BoxDef } from '../core/types';

// Danh sách chuẩn hiển thị trong thư viện (13 mẫu Tuck End theo thứ tự Packfino + các mẫu khác)
export const BOX_LIST: BoxDef[] = [
  // 13 mẫu Tuck End Boxes chuẩn Packfino
  reverseTuckEndBox,
  straightTuckEndBox,
  hangTabTuckEndBox,
  autoLockBottomBox,
  snapLockBottomBox,
  sealEndCarton,
  tissueBox,
  tuckTopGluedBottomBox,
  dispenserBox,
  teaBox,
  flatTissueBox,
  snapLockHangTabBox,
  crashLockHangTabBox,

  // Các mẫu thùng & hộp khác
  fefco0201,
  fefco0203,
  fefco0301,
  fefco0427,
  windowTuckEnd,
];

export const BOX_REGISTRY: Record<string, BoxDef> = {
  // Primary Packfino IDs
  'reverse-tuck-end-box': reverseTuckEndBox,
  'straight-tuck-end-box': straightTuckEndBox,
  'hang-tab-tuck-end-box': hangTabTuckEndBox,
  'auto-lock-bottom-box': autoLockBottomBox,
  'snap-lock-bottom-box': snapLockBottomBox,
  'seal-end-carton': sealEndCarton,
  'tissue-box': tissueBox,
  'tuck-top-glued-bottom-box': tuckTopGluedBottomBox,
  'dispenser-box': dispenserBox,
  'tea-box': teaBox,
  'flat-tissue-box': flatTissueBox,
  'snap-lock-hang-tab-box': snapLockHangTabBox,
  'crash-lock-hang-tab-box': crashLockHangTabBox,

  // Legacy alias IDs
  'tuck-end-reverse': reverseTuckEndBox,
  'tuck-end-straight': straightTuckEndBox,
  'hang-tab-tuck-end': hangTabTuckEndBox,
  'auto-lock-bottom': autoLockBottomBox,
  'snap-lock-bottom': snapLockBottomBox,
  'cube-tissue-box': tissueBox,
  'tuck-top-glued-bottom': tuckTopGluedBottomBox,
  'tea-bag-box': teaBox,
  'snap-lock-hang-tab': snapLockHangTabBox,
  'crash-lock-hang-tab': crashLockHangTabBox,

  // FEFCO & Window boxes
  'fefco-0201': fefco0201,
  'fefco-0203': fefco0203,
  'fefco-0301': fefco0301,
  'fefco-0427': fefco0427,
  'window-tuck-end': windowTuckEnd,
};

/**
 * Lấy BoxDef theo id (hỗ trợ cả primary id và alias)
 */
export function getBoxDef(id: string): BoxDef | undefined {
  return BOX_REGISTRY[id];
}

/**
 * Lấy danh sách tất cả các loại hộp đã đăng ký (không trùng lặp)
 */
export function getAllBoxes(): BoxDef[] {
  return [...BOX_LIST];
}
