// Định nghĩa loại hộp: Hộp khăn giấy chữ nhật (Rectangular Tissue Box - Seal End + Top Dispenser)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const flatTissueBox: BoxDef = {
  id: 'flat-tissue-box',
  name: 'Rectangular tissue box dieline',
  nameVi: 'Hộp khăn giấy chữ nhật',
  code: 'SEAL END + TOP DISPENSER',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A long, low glued carton with an oval dispensing opening on the top.',
  rangeText: 'From 20 × 12 × 25 mm to 500 × 300 × 600 mm',
  defaults: {
    l: 238,
    w: 89,
    h: 119,
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
      frontDispenser: 'flat-tissue',
    });
  },
};
