// Định nghĩa loại hộp: Hộp khăn giấy vuông (Cube Tissue Box - Seal End + Dispenser)
import { buildFoldingCarton } from './cartonTree';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const tissueBox: BoxDef = {
  id: 'tissue-box',
  name: 'Cube tissue box dieline',
  nameVi: 'Hộp khăn giấy vuông (Cube Tissue)',
  code: 'SEAL END + DISPENSER',
  style: 'tuck-end-boxes',
  category: 'tuck',
  summary: 'A glued cube carton with an oval dispensing opening cut through the top flaps.',
  rangeText: 'From 60 × 60 × 60 mm to 300 × 300 × 300 mm',
  defaults: {
    l: 111.8,
    w: 111.8,
    h: 132.1,
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
      topDispenser: true,
    });
  },
};

// Bí danh tương thích ngược
export const cubeTissueBox = tissueBox;
