// Định nghĩa loại hộp: Hộp trà túi lọc (Tea Bag Box - Tuck Top, Glued Bottom)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const teaBox: BoxDef = {
  id: 'tea-box',
  name: 'Tea bag box dieline',
  nameVi: 'Hộp trà túi lọc (Tea Bag Box)',
  code: 'TUCK TOP, GLUED BOTTOM',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A carton for 20 tea bags: glued bottom, reclosable tuck top.',
  rangeText: 'From 20 × 12 × 25 mm to 500 × 300 × 600 mm',
  defaults: {
    l: 139.7,
    w: 69.9,
    h: 76.2,
    t: 0.5,
  },
  options: [
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
      base: 'seal',
    });
  },
};

// Bí danh tương thích ngược
export const teaBagBox = teaBox;
