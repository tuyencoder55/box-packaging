// Định nghĩa loại hộp: Hộp dán keo hai đầu (Seal End Carton - ECMA A10.20)
import { chamfer, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const sealEndCarton: BoxDef = {
  id: 'seal-end-carton',
  name: 'Hộp dán keo hai đầu',
  code: 'ECMA A10.20',
  category: 'tuck',
  defaults: {
    l: 100,
    w: 50,
    h: 150,
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
  ],
  dims: [
    { panelId: 'panel-a', axis: 'u', param: 'l' },
    { panelId: 'panel-b', axis: 'u', param: 'w' },
    { panelId: 'panel-a', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h } = p;
    const g = Number(p.opts?.glueWidth ?? 15);
    const flapH = Math.round(w * 0.5); // Chiều rộng cánh dán bằng 1/2 chiều rộng hộp

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

    // 2. Nắp trên dán keo (Top Seal End)
    nodes.push({
      id: 'dust-top-b',
      parent: 'panel-b',
      edge: 'top',
      len: w,
      depth: flapH,
      shape: trapezoid(w, flapH, 3, 3),
      fold: 90,
      step: 2,
      label: 'Tai bụi trên B',
    });

    nodes.push({
      id: 'dust-top-d',
      parent: 'panel-d',
      edge: 'top',
      len: w,
      depth: flapH,
      shape: trapezoid(w, flapH, 3, 3),
      fold: 90,
      step: 2,
      label: 'Tai bụi trên D',
    });

    nodes.push({
      id: 'top-c',
      parent: 'panel-c',
      edge: 'top',
      len: l,
      depth: flapH,
      shape: chamfer(l, flapH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Cánh nắp trên sau (C)',
    });

    nodes.push({
      id: 'top-a',
      parent: 'panel-a',
      edge: 'top',
      len: l,
      depth: flapH,
      shape: chamfer(l, flapH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Cánh nắp trên trước (A)',
      glue: true,
    });

    // 3. Đáy dán keo (Bottom Seal End)
    nodes.push({
      id: 'bot-b',
      parent: 'panel-b',
      edge: 'bottom',
      len: w,
      depth: flapH,
      shape: trapezoid(w, flapH, 3, 3),
      fold: 90,
      step: 2,
      label: 'Tai bụi dưới B',
    });

    nodes.push({
      id: 'bot-d',
      parent: 'panel-d',
      edge: 'bottom',
      len: w,
      depth: flapH,
      shape: trapezoid(w, flapH, 3, 3),
      fold: 90,
      step: 2,
      label: 'Tai bụi dưới D',
    });

    nodes.push({
      id: 'bot-c',
      parent: 'panel-c',
      edge: 'bottom',
      len: l,
      depth: flapH,
      shape: chamfer(l, flapH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Cánh đáy sau (C)',
    });

    nodes.push({
      id: 'bot-a',
      parent: 'panel-a',
      edge: 'bottom',
      len: l,
      depth: flapH,
      shape: chamfer(l, flapH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Cánh đáy trước (A)',
      glue: true,
    });

    return nodes;
  },
};
