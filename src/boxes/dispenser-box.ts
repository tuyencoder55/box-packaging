// Định nghĩa loại hộp: Hộp rút trưng bày (Dispenser Box - ECMA A20.20 + DISPENSER)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const dispenserBox: BoxDef = {
  id: 'dispenser-box',
  name: 'Dispenser box dieline',
  nameVi: 'Hộp rút trưng bày (Dispenser Box)',
  code: 'ECMA A20.20 + DISPENSER',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A reverse tuck end carton with a die-cut dispensing opening in the front.',
  rangeText: 'From 12 × 10 × 15 mm to 500 × 350 × 600 mm',
  defaults: {
    l: 152.4,
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
      bottom: 'front',
      base: 'tuck',
      frontDispenser: 'dispenser',
    });
  },
};
