// Định nghĩa loại hộp: Hộp âm dương FEFCO 0301 (Hộp nắp đáy rời / Telescopic Box)
import { chamfer } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const fefco0301: BoxDef = {
  id: 'fefco-0301',
  name: 'Hộp âm dương (Nắp đáy rời)',
  code: 'FEFCO 0301',
  category: 'other',
  defaults: {
    l: 250,
    w: 180,
    h: 80,
    t: 2,
  },
  options: [
    {
      key: 'part',
      label: 'Chi tiết khuôn',
      type: 'select',
      choices: [
        { value: 'base', label: '1. Khay đáy (Phần Âm)' },
        { value: 'lid', label: '2. Khay nắp (Phần Dương)' },
      ],
      default: 'base',
    },
    {
      key: 'lidHeight',
      label: 'Chiều cao thành nắp',
      type: 'number',
      default: 40,
      min: 20,
      max: 150,
    },
    {
      key: 'clearance',
      label: 'Độ hở lồng nắp',
      type: 'number',
      default: 2,
      min: 1,
      max: 5,
    },
  ],
  dims: [
    { panelId: 'tray-face', axis: 'u', param: 'l' },
    { panelId: 'tray-face', axis: 'v', param: 'w' },
    { panelId: 'tray-wall-top', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h, t } = p;
    const part = String(p.opts?.part ?? 'base');
    const hLid = Number(p.opts?.lidHeight ?? 40);
    const clearance = Number(p.opts?.clearance ?? 2);

    // Xác định kích thước theo chi tiết đang chọn: Khay Đáy hay Khay Nắp
    const isLid = part === 'lid';
    const trayL = isLid ? l + 2 * t + clearance : l;
    const trayW = isLid ? w + 2 * t + clearance : w;
    const trayH = isLid ? hLid : h;
    const trayLabel = isLid ? 'Nắp' : 'Đáy';

    // Độ rộng tai dán góc (khoảng 35-50% chiều cao thành, tối đa 30mm)
    const gDepth = Math.max(15, Math.min(30, trayH * 0.45));

    const nodes: PanelNode[] = [];

    // 1. Mặt chính của khay (Panel gốc đặt tại 0, 0)
    nodes.push({
      id: 'tray-face',
      parent: null,
      len: trayL,
      depth: trayW,
      fold: 0,
      step: 0,
      label: `Mặt ${trayLabel}`,
    });

    // 2. Thành trên (gắn cạnh top của mặt chính)
    nodes.push({
      id: 'tray-wall-top',
      parent: 'tray-face',
      edge: 'top',
      len: trayL,
      depth: trayH,
      fold: 90,
      step: 1,
      label: `Thành trên (${trayLabel})`,
    });

    // Tai dán góc trên-trái (gắn cạnh left của thành trên)
    nodes.push({
      id: 'tray-glue-tl',
      parent: 'tray-wall-top',
      edge: 'left',
      len: trayH,
      depth: gDepth,
      shape: chamfer(trayH, gDepth, 5, 5),
      fold: 90,
      step: 2,
      label: 'Tai dán TL',
      glue: true,
    });

    // Tai dán góc trên-phải (gắn cạnh right của thành trên)
    nodes.push({
      id: 'tray-glue-tr',
      parent: 'tray-wall-top',
      edge: 'right',
      len: trayH,
      depth: gDepth,
      shape: chamfer(trayH, gDepth, 5, 5),
      fold: 90,
      step: 2,
      label: 'Tai dán TR',
      glue: true,
    });

    // 3. Thành dưới (gắn cạnh bottom của mặt chính)
    nodes.push({
      id: 'tray-wall-bottom',
      parent: 'tray-face',
      edge: 'bottom',
      len: trayL,
      depth: trayH,
      fold: 90,
      step: 1,
      label: `Thành dưới (${trayLabel})`,
    });

    // Tai dán góc dưới-trái (gắn cạnh left của thành dưới)
    nodes.push({
      id: 'tray-glue-bl',
      parent: 'tray-wall-bottom',
      edge: 'left',
      len: trayH,
      depth: gDepth,
      shape: chamfer(trayH, gDepth, 5, 5),
      fold: 90,
      step: 2,
      label: 'Tai dán BL',
      glue: true,
    });

    // Tai dán góc dưới-phải (gắn cạnh right của thành dưới)
    nodes.push({
      id: 'tray-glue-br',
      parent: 'tray-wall-bottom',
      edge: 'right',
      len: trayH,
      depth: gDepth,
      shape: chamfer(trayH, gDepth, 5, 5),
      fold: 90,
      step: 2,
      label: 'Tai dán BR',
      glue: true,
    });

    // 4. Thành trái (gắn cạnh left của mặt chính)
    nodes.push({
      id: 'tray-wall-left',
      parent: 'tray-face',
      edge: 'left',
      len: trayW,
      depth: trayH,
      fold: 90,
      step: 1,
      label: `Thành trái (${trayLabel})`,
    });

    // 5. Thành phải (gắn cạnh right của mặt chính)
    nodes.push({
      id: 'tray-wall-right',
      parent: 'tray-face',
      edge: 'right',
      len: trayW,
      depth: trayH,
      fold: 90,
      step: 1,
      label: `Thành phải (${trayLabel})`,
    });

    return nodes;
  },
};
