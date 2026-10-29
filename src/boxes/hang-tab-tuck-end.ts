// Định nghĩa loại hộp: Hộp nắp gài có tai treo (Hang Tab Tuck End Box - ECMA A20 + Hang Tab)
import { chamfer, rounded, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const hangTabTuckEnd: BoxDef = {
  id: 'hang-tab-tuck-end',
  name: 'Hộp nắp gài có tai treo',
  code: 'ECMA A20 + Hang Tab',
  category: 'tuck',
  defaults: {
    l: 75,
    w: 30,
    h: 120,
    t: 0.5,
  },
  options: [
    {
      key: 'headerHeight',
      label: 'Chiều cao tai treo (mm)',
      type: 'number',
      default: 35,
      min: 20,
      max: 60,
    },
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
      label: 'Chiều sâu lưỡi gài (mm)',
      type: 'number',
      default: 16,
      min: 12,
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
    const headerH = Number(p.opts?.headerHeight ?? 35);
    const g = Number(p.opts?.glueWidth ?? 15);
    const tuckH = Number(p.opts?.tuckDepth ?? 16);
    const dustH = Math.min(18, Math.max(10, w * 0.6));

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

    // 2. Tai treo (Hang Tab Header): vươn cao trên mặt sau C, vát bo 2 góc
    nodes.push({
      id: 'hang-header',
      parent: 'panel-c',
      edge: 'top',
      len: l,
      depth: headerH,
      shape: chamfer(l, headerH, 6, 6),
      fold: 0, // Cùng mặt phẳng với mặt sau C khi gập hộp 3D
      step: 0,
      label: 'Tai treo móc kệ (Header)',
    });

    // 3. Nắp trên gắn vào Mặt trước A (để khi gập vào nắp không đè che tai treo)
    nodes.push({
      id: 'top-lid',
      parent: 'panel-a',
      edge: 'top',
      len: l,
      depth: w,
      fold: 90,
      step: 3,
      label: 'Nắp trên',
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

    // Tai bụi trên ở 2 mặt hông B và D
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

    // 4. Nắp đáy dạng gài ngược (Bottom tuck lid gắn vào mặt sau C)
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

    // Tai bụi dưới ở 2 mặt hông B và D
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
