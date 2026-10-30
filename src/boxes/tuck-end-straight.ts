// Định nghĩa loại hộp: Hộp nắp gài thẳng (Straight Tuck End Box - STE)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const straightTuckEndBox: BoxDef = {
  id: 'straight-tuck-end-box',
  name: 'Straight tuck end box dieline',
  nameVi: 'Hộp nắp gài thẳng (Straight Tuck)',
  code: 'ECMA A20.20.03',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'Both tucks close from the front for a clean, uninterrupted front panel.',
  rangeText: 'From 12 × 10 × 10 mm to 500 × 350 × 600 mm',
  defaults: {
    l: 76.2,
    w: 76.2,
    h: 101.6,
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
      bottom: 'back',
      base: 'tuck',
    });
  },
};

// Bí danh tương thích ngược
export const tuckEndStraight = straightTuckEndBox;
