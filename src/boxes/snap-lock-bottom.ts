// Định nghĩa loại hộp: Hộp đáy gài 1-2-3 (Snap Lock Bottom - ECMA A50.20 / FEFCO 0215)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const snapLockBottomBox: BoxDef = {
  id: 'snap-lock-bottom-box',
  name: 'Snap lock bottom box dieline',
  nameVi: 'Hộp đáy gài 1-2-3 (Snap Lock)',
  code: 'ECMA A50.20 / FEFCO 0215',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A tuck-top carton with a 1-2-3 snap lock bottom — no glue, no tape, a firm base.',
  rangeText: 'From 25 × 25 × 30 mm to 500 × 350 × 600 mm',
  defaults: {
    l: 101.6,
    w: 76.2,
    h: 152.4,
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
      base: 'snap',
    });
  },
};

// Bí danh tương thích ngược
export const snapLockBottom = snapLockBottomBox;
