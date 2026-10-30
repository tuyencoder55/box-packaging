// Định nghĩa loại hộp: Hộp nắp gài có tai treo (Hang Tab Tuck End Box)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const hangTabTuckEndBox: BoxDef = {
  id: 'hang-tab-tuck-end-box',
  name: 'Hang tab tuck end box dieline',
  nameVi: 'Hộp nắp gài có tai treo (Hang Tab)',
  code: 'ECMA A20 + HANG TAB',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A peg-hook carton: the back rises into a double-thick header with a euro slot.',
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
      label: 'Rộng lưỡi dán (mm)',
      type: 'number',
      default: 15,
      min: 10,
      max: 25,
    },
    {
      key: 'tuckDepth',
      label: 'Chiều sâu lưỡi gài (mm)',
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
      bottom: 'back',
      base: 'tuck',
      header,
    });
  },
};

// Bí danh tương thích ngược
export const hangTabTuckEnd = hangTabTuckEndBox;
