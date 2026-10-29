// Định nghĩa loại hộp: Hộp nắp gài đáy khoá cài 1-2-3 (Snap Lock Bottom - ECMA A50.20 / FEFCO 0215)
import { chamfer, rounded, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode, Pt } from '../core/types';

export const snapLockBottom: BoxDef = {
  id: 'snap-lock-bottom',
  name: 'Hộp nắp gài đáy khoá cài 1-2-3',
  code: 'ECMA A50.20',
  category: 'tuck',
  defaults: {
    l: 80,
    w: 60,
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
    const dustH = Math.min(22, Math.max(12, w * 0.6));

    // Kích thước các cánh đáy khoá 1-2-3 (Snap lock)
    const v = w * 0.5; // Chiều sâu cánh lớn
    const b = Math.min(w * 0.25, 14); // Chiều dài lưỡi gài nhô ra
    const y = l * 0.36; // Bề rộng lưỡi gài
    const r = (l - y) / 2; // Khoảng cách từ mép đến lưỡi gài
    const f = Math.min(l * 0.45, v); // Chiều sâu 2 cánh hông

    const nodes: PanelNode[] = [];

    // 1. Thân hộp chuỗi ngang: Glue -> A (trước) -> B (hông trái) -> C (sau) -> D (hông phải)
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
      step: 4,
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
      step: 5,
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
      step: 3,
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
      step: 3,
      label: 'Tai bụi trên D',
    });

    // 3. Hệ thống 4 cánh đáy khoá cài 1-2-3 (Snap lock bottom)
    // Bước 1: Hai cánh hông vát góc gập trước
    nodes.push({
      id: 'bot-b',
      parent: 'panel-b',
      edge: 'bottom',
      len: w,
      depth: f,
      shape: trapezoid(w, f, f * 0.5, f * 0.5),
      fold: 90,
      step: 1,
      label: 'Tai khoá hông B',
    });

    nodes.push({
      id: 'bot-d',
      parent: 'panel-d',
      edge: 'bottom',
      len: w,
      depth: f,
      shape: trapezoid(w, f, f * 0.5, f * 0.5),
      fold: 90,
      step: 1,
      label: 'Tai khoá hông D',
    });

    // Bước 2: Cánh đáy sau C (khoá cái, có ngàm khuyết nhận lưỡi gài)
    const shapeBotC: Pt[] = [
      [0, 0],
      [l, 0],
      [l, v],
      [r + y, v],
      [r + y - 1, v - 3],
      [r + 1, v - 3],
      [r, v],
      [0, v],
    ];

    nodes.push({
      id: 'bot-c',
      parent: 'panel-c',
      edge: 'bottom',
      len: l,
      depth: v,
      shape: shapeBotC,
      fold: 90,
      step: 2,
      label: 'Cánh khoá sau (C)',
    });

    // Bước 3: Cánh đáy trước A (khoá đực, có lưỡi gài nhô ra ăn vào ngàm C)
    const shapeBotA: Pt[] = [
      [0, 0],
      [l, 0],
      [l, v],
      [r + y, v],
      [r + y - 3, v + b],
      [r + 3, v + b],
      [r, v],
      [0, v],
    ];

    nodes.push({
      id: 'bot-a',
      parent: 'panel-a',
      edge: 'bottom',
      len: l,
      depth: v + b,
      shape: shapeBotA,
      fold: 90,
      step: 3,
      label: 'Lưỡi khoá trước (A)',
    });

    return nodes;
  },
};
