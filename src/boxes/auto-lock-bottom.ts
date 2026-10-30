// Định nghĩa loại hộp: Hộp đáy khoá tự động (Auto Lock Bottom Box / Crash Lock - ECMA A60.20)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const autoLockBottomBox: BoxDef = {
  id: 'auto-lock-bottom-box',
  name: 'Auto lock bottom box dieline',
  nameVi: 'Hộp đáy khoá tự động (Crash Lock)',
  code: 'ECMA A60.20',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A tuck-top carton with a pre-glued crash-lock bottom that pops into place instantly.',
  rangeText: 'From 25 × 25 × 30 mm to 400 × 300 × 600 mm',
  defaults: {
    l: 76.2,
    w: 76.2,
    h: 127,
    t: 0.5,
  },
  options: [
    {
      key: 'glueWidth',
      label: 'Rộng lưỡi dán thân (mm)',
      type: 'number',
      default: 15,
      min: 10,
      max: 25,
    },
    {
      key: 'tuckDepth',
      label: 'Chiều sâu lưỡi gài trên (mm)',
      type: 'number',
      default: 16,
      min: 12,
      max: 30,
    },
  ],
  dims: [
    { panelId: 'panel-front', axis: 'u', param: 'l' },
    { panelId: 'panel-left', axis: 'u', param: 'w' },
    { panelId: 'panel-front', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    return buildFoldingCarton(p, {
      top: 'back',
      base: 'crash',
    });
  },
};

// Bí danh tương thích ngược
export const autoLockBottom = autoLockBottomBox;
