// Định nghĩa loại hộp: Hộp tai treo đáy gài 1-2-3 (Hang Tab with Snap Lock Bottom - ECMA A50 + HANG TAB)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const snapLockHangTabBox: BoxDef = {
  id: 'snap-lock-hang-tab-box',
  name: 'Hang tab box with snap lock bottom dieline',
  nameVi: 'Hộp tai treo đáy gài 1-2-3',
  code: 'ECMA A50 + HANG TAB',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A peg-hook carton with a 1-2-3 snap lock bottom for heavier hanging products.',
  rangeText: 'From 15 × 8 × 30 mm to 400 × 200 × 500 mm',
  defaults: {
    l: 76.2,
    w: 25.4,
    h: 127,
    t: 0.5,
  },
  options: [
    {
      key: 'header',
      label: 'Chiều cao thẻ treo (mm)',
      type: 'number',
      default: 38,
      min: 20,
      max: 100,
    },
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
    const header = Number(p.opts?.header ?? 38);
    return buildFoldingCarton(p, {
      top: 'front',
      base: 'snap',
      header,
    });
  },
};

// Bí danh tương thích ngược
export const snapLockHangTab = snapLockHangTabBox;
