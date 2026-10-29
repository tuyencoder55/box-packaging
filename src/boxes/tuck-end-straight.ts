// Định nghĩa loại hộp: Hộp nắp gài thẳng (Straight Tuck End - STE)
import { chamfer, rounded, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const tuckEndStraight: BoxDef = {
  id: 'tuck-end-straight',
  name: 'Hộp nắp gài thẳng',
  code: 'STE',
  category: 'tuck',
  defaults: {
    l: 80,
    w: 50,
    h: 140,
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
    { panelId: 'panel-a', axis: 'u', param: 'l' },
    { panelId: 'panel-b', axis: 'u', param: 'w' },
    { panelId: 'panel-a', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h } = p;
    const g = Number(p.opts?.glueWidth ?? 15);
    const tuckH = Number(p.opts?.tuckDepth ?? 16);
    const dustH = Math.min(20, Math.max(12, w * 0.6));

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

    // 2. Nắp trên & Nắp đáy (Hộp gài thẳng: CẢ HAI CÙNG GẮN VÀO MẶT SAU C)
    // Nắp trên gắn top của C
    nodes.push({
      id: 'top-lid',
      parent: 'panel-c',
      edge: 'top',
      len: l,
      depth: w,
      fold: 90,
      step: 3,
      label: 'Nắp trên',
    });

    // Lưỡi gài nắp trên
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

    // Nắp đáy gắn bottom của C
    nodes.push({
      id: 'bot-lid',
      parent: 'panel-c',
      edge: 'bottom',
      len: l,
      depth: w,
      fold: 90,
      step: 3,
      label: 'Nắp đáy',
    });

    // Lưỡi gài nắp đáy
    nodes.push({
      id: 'bot-tuck',
      parent: 'bot-lid',
      edge: 'bottom',
      len: l,
      depth: tuckH,
      shape: rounded(l, tuckH, 4, 4),
      fold: 90,
      step: 4,
      label: 'Lưỡi gài đáy',
    });

    // 3. Tai bụi hông (Dust flaps trên và dưới mặt B và D)
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
      id: 'dust-bot-b',
      parent: 'panel-b',
      edge: 'bottom',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 2, 4),
      fold: 90,
      step: 2,
      label: 'Tai bụi dưới B',
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

    nodes.push({
      id: 'dust-bot-d',
      parent: 'panel-d',
      edge: 'bottom',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 4, 2),
      fold: 90,
      step: 2,
      label: 'Tai bụi dưới D',
    });

    return nodes;
  },
};

