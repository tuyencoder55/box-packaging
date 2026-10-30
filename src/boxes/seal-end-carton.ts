// Định nghĩa loại hộp: Hộp dán keo hai đầu (Seal End Carton - ECMA A10.20)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const sealEndCarton: BoxDef = {
  id: 'seal-end-carton',
  name: 'Seal end carton dieline',
  nameVi: 'Hộp dán keo hai đầu (Seal End)',
  code: 'ECMA A10.20',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A folding carton glued shut at both ends — tamper-evident and sift-proof.',
  rangeText: 'From 20 × 12 × 25 mm to 500 × 300 × 600 mm',
  defaults: {
    l: 101.6,
    w: 50.8,
    h: 152.4,
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
  ],
  dims: [
    { panelId: 'panel-front', axis: 'u', param: 'l' },
    { panelId: 'panel-left', axis: 'u', param: 'w' },
    { panelId: 'panel-front', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    return buildFoldingCarton(p, {
      top: 'seal',
      base: 'seal',
    });
  },
};
