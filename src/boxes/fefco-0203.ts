// Định nghĩa loại hộp: Thùng carton nắp chồm FEFCO 0203 (Full Overlap Container - FOL)
import { trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const fefco0203: BoxDef = {
  id: 'fefco-0203',
  name: 'Thùng carton nắp chồm',
  code: 'FEFCO 0203',
  category: 'carton',
  defaults: {
    l: 300,
    w: 200,
    h: 150,
    t: 3,
  },
  options: [
    {
      key: 'glueWidth',
      label: 'Rộng lưỡi dán',
      type: 'number',
      default: 35,
      min: 20,
      max: 50,
    },
    {
      key: 'slotWidth',
      label: 'Độ rộng rãnh xẻ (Slot)',
      type: 'number',
      default: 6,
      min: 0,
      max: 15,
    },
  ],
  dims: [
    { panelId: 'panel-a', axis: 'u', param: 'l' },
    { panelId: 'panel-b', axis: 'u', param: 'w' },
    { panelId: 'panel-a', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h, t } = p;
    const g = Number(p.opts?.glueWidth ?? 35);
    // Độ rộng rãnh xẻ nắp: mặc định 6mm cho sóng mỏng (<=3mm), 8mm cho sóng dày (>3mm)
    const defaultSlot = t > 3 ? 8 : 6;
    const s = Math.max(0, Number(p.opts?.slotWidth ?? defaultSlot));
    const halfS = s / 2;

    const nodes: PanelNode[] = [];

    // 1. Thân hộp (chuỗi ngang từ trái sang phải: glue -> A -> B -> C -> D)
    nodes.push({
      id: 'panel-a',
      parent: null,
      len: l,
      depth: h,
      fold: 0,
      step: 0,
      label: 'Mặt trước (A)',
    });

    // Lưỡi dán (tai dán) gắn cạnh left của A, hình thang vát góc 15° chuẩn carton
    nodes.push({
      id: 'glue',
      parent: 'panel-a',
      edge: 'left',
      len: h,
      depth: g,
      shape: trapezoid(h, g, 8, 8),
      fold: 90,
      step: 1,
      label: 'Tai dán',
      glue: true,
    });

    // Mặt hông B gắn cạnh right của A
    nodes.push({
      id: 'panel-b',
      parent: 'panel-a',
      edge: 'right',
      len: h,
      depth: w,
      fold: 90,
      step: 1,
      label: 'Mặt hông (B)',
    });

    // Mặt sau C gắn cạnh right của B
    nodes.push({
      id: 'panel-c',
      parent: 'panel-b',
      edge: 'right',
      len: h,
      depth: l,
      fold: 90,
      step: 1,
      label: 'Mặt sau (C)',
    });

    // Mặt hông D gắn cạnh right của C
    nodes.push({
      id: 'panel-d',
      parent: 'panel-c',
      edge: 'right',
      len: h,
      depth: w,
      fold: 90,
      step: 1,
      label: 'Mặt hông (D)',
    });

    // 2. Nắp trên (top flaps) & nắp dưới (bottom flaps) có khe rãnh xẻ (Slot)
    // Cánh chính A và C có depth = W (nắp chồm)
    // Cánh phụ B và D có depth = W / 2 (lót trong)
    const flapsConfig = [
      { id: 'b', parentId: 'panel-b', offset: halfS, len: Math.max(10, w - s), depth: w / 2, step: 2, label: 'B' },
      { id: 'd', parentId: 'panel-d', offset: halfS, len: Math.max(10, w - s), depth: w / 2, step: 2, label: 'D' },
      { id: 'a', parentId: 'panel-a', offset: 0, len: Math.max(10, l - halfS), depth: w, step: 3, label: 'A (Chồm)' },
      { id: 'c', parentId: 'panel-c', offset: halfS, len: Math.max(10, l - s), depth: w, step: 4, label: 'C (Chồm)' },
    ];

    for (const f of flapsConfig) {
      nodes.push({
        id: `top-flap-${f.id}`,
        parent: f.parentId,
        edge: 'top',
        len: f.len,
        depth: f.depth,
        offset: f.offset,
        fold: 90,
        step: f.step,
        label: `Nắp trên ${f.label}`,
      });

      nodes.push({
        id: `bot-flap-${f.id}`,
        parent: f.parentId,
        edge: 'bottom',
        len: f.len,
        depth: f.depth,
        offset: f.offset,
        fold: 90,
        step: f.step,
        label: `Nắp dưới ${f.label}`,
      });
    }

    return nodes;
  },
};
