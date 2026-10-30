// Định nghĩa loại hộp: Hộp nắp gài đáy dán keo (Tuck Top Glued Bottom - ECMA A20 / A10 COMBINATION)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const tuckTopGluedBottomBox: BoxDef = {
  id: 'tuck-top-glued-bottom-box',
  name: 'Tuck top glued bottom box dieline',
  nameVi: 'Hộp nắp gài đáy dán keo',
  code: 'ECMA A20 / A10 COMBINATION',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A carton with a glued, sift-proof bottom and a reclosable tuck lid on top.',
  rangeText: 'From 20 × 12 × 25 mm to 500 × 300 × 600 mm',
  defaults: {
    l: 88.9,
    w: 50.8,
    h: 139.7,
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
export const tuckTopGluedBottom = tuckTopGluedBottomBox;
