// Định nghĩa loại hộp: Hộp đựng gói trà (Tea Bag Box - Tuck Top Glued Bottom)
import { chamfer, rounded, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const teaBagBox: BoxDef = {
  id: 'tea-bag-box',
  name: 'Hộp đựng gói trà',
  code: 'ECMA A20/A10 (Tea Pack)',
  category: 'tuck',
  defaults: {
    l: 140,
    w: 70,
    h: 76,
    t: 0.5,
  },
  options: [
    {
      key: 'glueWidth',
      label: 'Rộng lưỡi dán thân (mm)',
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
    { panelId: 'panel-a', axis: 'u', param: 'l' },
    { panelId: 'panel-b', axis: 'u', param: 'w' },
    { panelId: 'panel-a', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h } = p;
    const g = Number(p.opts?.glueWidth ?? 15);
    const tuckH = Number(p.opts?.tuckDepth ?? 16);
    const dustH = Math.min(22, Math.max(12, w * 0.5));
    const botH = Math.round(w * 0.5); // Nắp dán đáy chống lọt bụi bằng 1/2 chiều rộng

    const nodes: PanelNode[] = [];

    // 1. Thân hộp chuỗi ngang: Glue -> A (trước) -> B (hông) -> C (sau) -> D (hông)
    nodes.push({
      id: 'panel-a',
      parent: null,
      len: l,
      depth: h,
      fold: 0,
      step: 0,
      label: 'Mặt trước (A)',
    });

    nodes.push({
      id: 'glue',
      parent: 'panel-a',
      edge: 'left',
      len: h,
      depth: g,
      shape: chamfer(h, g, 3, 3),
      fold: 90,
      step: 1,
      label: 'Lưỡi dán',
      glue: true,
    });

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

    // 2. Nắp trên gài tiện lợi (Reclosable tuck top trên mặt sau C)
    nodes.push({
      id: 'top-lid',
      parent: 'panel-c',
      edge: 'top',
      len: l,
      depth: w,
      fold: 90,
      step: 3,
      label: 'Nắp gài trên',
    });

    nodes.push({
      id: 'top-tuck',
      parent: 'top-lid',
      edge: 'top',
      len: l,
      depth: tuckH,
      shape: rounded(l, tuckH, 4, 4),
      fold: 90,
      step: 4,
      label: 'Lưỡi gài trên',
    });

    nodes.push({
      id: 'dust-top-b',
      parent: 'panel-b',
      edge: 'top',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 2, 4),
      fold: 90,
      step: 2,
      label: 'Tai bụi trên B',
    });

    nodes.push({
      id: 'dust-top-d',
      parent: 'panel-d',
      edge: 'top',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 4, 2),
      fold: 90,
      step: 2,
      label: 'Tai bụi trên D',
    });

    // 3. Đáy dán keo chống lọt bụi (Glued sift-proof bottom)
    nodes.push({
      id: 'bot-b',
      parent: 'panel-b',
      edge: 'bottom',
      len: w,
      depth: botH,
      shape: trapezoid(w, botH, 3, 3),
      fold: 90,
      step: 2,
      label: 'Tai bụi dưới B',
    });

    nodes.push({
      id: 'bot-d',
      parent: 'panel-d',
      edge: 'bottom',
      len: w,
      depth: botH,
      shape: trapezoid(w, botH, 3, 3),
      fold: 90,
      step: 2,
      label: 'Tai bụi dưới D',
    });

    nodes.push({
      id: 'bot-c',
      parent: 'panel-c',
      edge: 'bottom',
      len: l,
      depth: botH,
      shape: chamfer(l, botH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Cánh đáy sau (C)',
    });

    nodes.push({
      id: 'bot-a',
      parent: 'panel-a',
      edge: 'bottom',
      len: l,
      depth: botH,
      shape: chamfer(l, botH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Cánh đáy trước (A)',
      glue: true,
    });

    return nodes;
  },
};
