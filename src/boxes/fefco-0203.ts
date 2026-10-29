// Định nghĩa loại hộp: Thùng carton nắp chồm FEFCO 0203 (Full Overlap Container - FOL)
import { chamfer } from '../core/shapes';
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
      default: 30,
      min: 20,
      max: 50,
    },
  ],
  dims: [
    { panelId: 'panel-a', axis: 'u', param: 'l' },
    { panelId: 'panel-b', axis: 'u', param: 'w' },
    { panelId: 'panel-a', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h } = p;
    const g = Number(p.opts?.glueWidth ?? 30);

    const nodes: PanelNode[] = [];

    // 1. Thân hộp (chuỗi ngang từ trái sang phải: glue -> A -> B -> C -> D)
    // Panel A (mặt trước) là panel gốc (parent: null), đặt tại (0,0)
    nodes.push({
      id: 'panel-a',
      parent: null,
      len: l,
      depth: h,
      fold: 0,
      step: 0,
      label: 'Mặt trước (A)',
    });

    // Lưỡi dán gắn cạnh left của A, vát 2 góc xa cạnh gấp 5 mm
    nodes.push({
      id: 'glue',
      parent: 'panel-a',
      edge: 'left',
      len: h,
      depth: g,
      shape: chamfer(h, g, 5, 5),
      fold: 90,
      step: 1,
      label: 'Lưỡi dán',
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

    // 2. Nắp trên (top flaps) & nắp dưới (bottom flaps)
    // Nắp chồm FEFCO 0203:
    // Cánh chính A và C có chiều sâu phủ kín toàn bộ chiều rộng W (chồm lên nhau)
    // Cánh phụ B và D (lót trong) có chiều sâu w / 2 để lót bên dưới
    // Thứ tự gấp:
    // Tai lót B và D gấp trước (step 2)
    // Cánh A gấp vào (step 3)
    // Cánh C gấp chồm lên trên cánh A (step 4)
    const flapsConfig = [
      { id: 'b', parentId: 'panel-b', len: w, depth: w / 2, step: 2, label: 'B' },
      { id: 'd', parentId: 'panel-d', len: w, depth: w / 2, step: 2, label: 'D' },
      { id: 'a', parentId: 'panel-a', len: l, depth: w, step: 3, label: 'A (Chồm)' },
      { id: 'c', parentId: 'panel-c', len: l, depth: w, step: 4, label: 'C (Chồm)' },
    ];

    for (const f of flapsConfig) {
      nodes.push({
        id: `top-flap-${f.id}`,
        parent: f.parentId,
        edge: 'top',
        len: f.len,
        depth: f.depth,
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
        fold: 90,
        step: f.step,
        label: `Nắp dưới ${f.label}`,
      });
    }

    return nodes;
  },
};
