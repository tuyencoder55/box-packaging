// Định nghĩa loại hộp: Hộp nắp gài đối xứng (Reverse Tuck End Box - RTE)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const reverseTuckEndBox: BoxDef = {
  id: 'reverse-tuck-end-box',
  name: 'Reverse tuck end box dieline',
  nameVi: 'Hộp nắp gài đối xứng (Reverse Tuck)',
  code: 'ECMA A20.20',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'The classic retail carton: top tuck enters from the front, bottom tuck from the back (or vice-versa).',
  rangeText: 'From 12 × 10 × 15 mm to 500 × 350 × 600 mm',
  defaults: {
    l: 63.5,
    w: 38.1,
    h: 127,
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
    return buildFoldingCarton(p, {
      top: 'back',
      bottom: 'front',
      base: 'tuck',
    });
  },
};

// Bí danh tương thích ngược
export const tuckEndReverse = reverseTuckEndBox;
