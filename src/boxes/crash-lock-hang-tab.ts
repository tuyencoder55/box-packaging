// Định nghĩa loại hộp: Hộp tai treo đáy khoá tự động (Hang Tab Auto Lock / Crash Lock - ECMA A60 + Hang Tab)
import { chamfer, rounded, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const crashLockHangTab: BoxDef = {
  id: 'crash-lock-hang-tab',
  name: 'Hộp tai treo đáy khoá tự động',
  code: 'ECMA A60 + Hang Tab',
  category: 'auto-lock',
  defaults: {
    l: 75,
    w: 40,
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
      label: 'Chiều sâu lưỡi gài trên (mm)',
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
    const dustH = Math.min(20, Math.max(10, w * 0.6));
    const botDepth = Math.round(w * 0.6); // Chiều sâu cánh đáy khoá tự động

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

    // 2. Tai treo vươn cao trên mặt sau C
    nodes.push({
      id: 'hang-header',
      parent: 'panel-c',
      edge: 'top',
      len: l,
      depth: headerH,
      shape: chamfer(l, headerH, 6, 6),
      fold: 0,
      step: 0,
      label: 'Tai treo móc kệ (Header)',
    });

    // 3. Nắp trên dạng gài gắn vào Mặt trước A
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

    // 4. Hệ thống 4 cánh đáy khoá tự động (Crash lock bottom)
    const shapeBotA: [number, number][] = [
      [0, 0],
      [l, 0],
      [l - 5, botDepth],
      [l * 0.5 + 4, botDepth],
      [l * 0.5, botDepth - 4],
      [5, botDepth - 4],
      [0, botDepth - 8],
    ];

    nodes.push({
      id: 'bot-a',
      parent: 'panel-a',
      edge: 'bottom',
      len: l,
      depth: botDepth,
      shape: shapeBotA,
      fold: 90,
      step: 2,
      label: 'Đáy khoá trước (A)',
    });

    const shapeBotC: [number, number][] = [
      [0, 0],
      [l, 0],
      [l, botDepth - 8],
      [l - 5, botDepth - 4],
      [l * 0.5, botDepth - 4],
      [l * 0.5 - 4, botDepth],
      [5, botDepth],
      [0, 0],
    ];

    nodes.push({
      id: 'bot-c',
      parent: 'panel-c',
      edge: 'bottom',
      len: l,
      depth: botDepth,
      shape: shapeBotC,
      fold: 90,
      step: 2,
      label: 'Đáy khoá sau (C)',
    });

    const shapeBotSide: [number, number][] = [
      [0, 0],
      [w, 0],
      [w - 5, botDepth],
      [5, botDepth],
    ];

    nodes.push({
      id: 'bot-b',
      parent: 'panel-b',
      edge: 'bottom',
      len: w,
      depth: botDepth,
      shape: shapeBotSide,
      fold: 90,
      step: 2,
      label: 'Cánh đáy hông (B)',
    });

    nodes.push({
      id: 'bot-d',
      parent: 'panel-d',
      edge: 'bottom',
      len: w,
      depth: botDepth,
      shape: shapeBotSide,
      fold: 90,
      step: 2,
      label: 'Cánh đáy hông (D)',
    });

    return nodes;
  },
};
