// Định nghĩa loại hộp: Hộp đáy khoá tự động (Crash Lock Bottom / Auto Lock Bottom)
import { chamfer, rounded, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const autoLockBottom: BoxDef = {
  id: 'auto-lock-bottom',
  name: 'Hộp đáy khoá tự động',
  code: 'ALB',
  category: 'auto-lock',
  defaults: {
    l: 80,
    w: 50,
    h: 140,
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
    const dustH = Math.min(20, Math.max(12, w * 0.6));
    const botDepth = Math.round(w * 0.6); // Chiều sâu cánh đáy khoá

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

    // 2. Nắp trên dạng gài (Tuck top trên mặt sau C)
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

    // Tai bụi nắp trên ở 2 mặt hông B và D
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

    // 3. Hệ thống 4 cánh đáy khoá (Bottom lock flaps)
    // Cánh đáy A (Mặt trước): cánh lớn vát góc 45 độ tạo ngàm móc
    const shapeBotA: [number, number][] = [
      [0, 0],
      [l, 0],
      [l - 6, botDepth],
      [l * 0.5 + 4, botDepth],
      [l * 0.5, botDepth - 4],
      [6, botDepth - 4],
      [0, botDepth - 10],
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

    // Cánh đáy C (Mặt sau): đối xứng với cánh A để lồng khoá
    const shapeBotC: [number, number][] = [
      [0, 0],
      [l, 0],
      [l, botDepth - 10],
      [l - 6, botDepth - 4],
      [l * 0.5, botDepth - 4],
      [l * 0.5 - 4, botDepth],
      [6, botDepth],
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

    // Cánh đáy B và D (Mặt hông): hai cánh đỡ góc vát 45 độ
    const shapeBotSide: [number, number][] = [
      [0, 0],
      [w, 0],
      [w - 6, botDepth],
      [6, botDepth],
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
