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
      label: 'Chi tiết hiển thị',
      type: 'select',
      choices: [
        { value: 'both', label: 'Cả nắp và đáy (Bộ đầy đủ)' },
        { value: 'base', label: 'Chỉ khay đáy (Âm)' },
        { value: 'lid', label: 'Chỉ khay nắp (Dương)' },
      ],
      default: 'both',
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
    { panelId: 'base-face', axis: 'u', param: 'l' },
    { panelId: 'base-face', axis: 'v', param: 'w' },
    { panelId: 'base-wall-top', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h, t } = p;
    const part = String(p.opts?.part ?? 'both');
    const hLid = Number(p.opts?.lidHeight ?? 40);
    const clearance = Number(p.opts?.clearance ?? 2);
    const glueDepth = Math.max(15, Math.min(25, h * 0.4));
    const glueLidDepth = Math.max(15, Math.min(25, hLid * 0.4));

    // Kích thước nắp (phủ ngoài đáy + 2t + độ hở)
    const lLid = l + 2 * t + clearance;
    const wLid = w + 2 * t + clearance;

    const nodes: PanelNode[] = [];

    // HÀM TẠO 1 KHAY (Đáy hoặc Nắp)
    function createTray(
      prefix: string,
      length: number,
      width: number,
      height: number,
      gDepth: number,
      parentId: string | null,
      attachEdge?: 'top' | 'right' | 'bottom' | 'left',
      trayLabel = 'Khay'
    ) {
      // Mặt chính của khay
      nodes.push({
        id: `${prefix}-face`,
        parent: parentId,
        edge: attachEdge,
        len: length,
        depth: width,
        fold: 0,
        step: 0,
        label: `${trayLabel} chính`,
      });

      // Thành trên
      nodes.push({
        id: `${prefix}-wall-top`,
        parent: `${prefix}-face`,
        edge: 'top',
        len: length,
        depth: height,
        fold: 90,
        step: 1,
        label: `${trayLabel} - Thành trên`,
      });

      // Tai dán góc trái trên
      nodes.push({
        id: `${prefix}-glue-tl`,
        parent: `${prefix}-wall-top`,
        edge: 'left',
        len: height,
        depth: gDepth,
        shape: chamfer(height, gDepth, 4, 4),
        fold: 90,
        step: 2,
        label: `${trayLabel} - Tai dán TL`,
        glue: true,
      });

      // Tai dán góc phải trên
      nodes.push({
        id: `${prefix}-glue-tr`,
        parent: `${prefix}-wall-top`,
        edge: 'right',
        len: height,
        depth: gDepth,
        shape: chamfer(height, gDepth, 4, 4),
        fold: 90,
        step: 2,
        label: `${trayLabel} - Tai dán TR`,
        glue: true,
      });

      // Thành dưới
      nodes.push({
        id: `${prefix}-wall-bottom`,
        parent: `${prefix}-face`,
        edge: 'bottom',
        len: length,
        depth: height,
        fold: 90,
        step: 1,
        label: `${trayLabel} - Thành dưới`,
      });

      // Tai dán góc trái dưới
      nodes.push({
        id: `${prefix}-glue-bl`,
        parent: `${prefix}-wall-bottom`,
        edge: 'left',
        len: height,
        depth: gDepth,
        shape: chamfer(height, gDepth, 4, 4),
        fold: 90,
        step: 2,
        label: `${trayLabel} - Tai dán BL`,
        glue: true,
      });

      // Tai dán góc phải dưới
      nodes.push({
        id: `${prefix}-glue-br`,
        parent: `${prefix}-wall-bottom`,
        edge: 'right',
        len: height,
        depth: gDepth,
        shape: chamfer(height, gDepth, 4, 4),
        fold: 90,
        step: 2,
        label: `${trayLabel} - Tai dán BR`,
        glue: true,
      });

      // Thành trái
      nodes.push({
        id: `${prefix}-wall-left`,
        parent: `${prefix}-face`,
        edge: 'left',
        len: width,
        depth: height,
        fold: 90,
        step: 1,
        label: `${trayLabel} - Thành trái`,
      });

      // Thành phải
      nodes.push({
        id: `${prefix}-wall-right`,
        parent: `${prefix}-face`,
        edge: 'right',
        len: width,
        depth: height,
        fold: 90,
        step: 1,
        label: `${trayLabel} - Thành phải`,
      });
    }

    if (part === 'base') {
      // Chỉ khay đáy
      createTray('base', l, w, h, glueDepth, null, undefined, 'Đáy');
    } else if (part === 'lid') {
      // Chỉ khay nắp
      createTray('base', lLid, wLid, hLid, glueLidDepth, null, undefined, 'Nắp');
    } else {
      // Cả nắp và đáy trên cùng 1 bản vẽ khuôn bế
      // Khay Đáy trước
      createTray('base', l, w, h, glueDepth, null, undefined, 'Đáy');

      // Khoảng đệm phân cách giữa 2 khay trên tờ khuôn (bridge)
      const gap = h + hLid + 20; // Đủ khoảng cách để 2 khay không chạm nhau
      nodes.push({
        id: 'separator-bridge',
        parent: 'base-wall-right',
        edge: 'right',
        len: w,
        depth: gap,
        fold: 0,
        step: 0,
        label: 'Đường phân cách',
      });

      // Khay Nắp nối tiếp sau cầu phân cách
      createTray('lid', lLid, wLid, hLid, glueLidDepth, 'separator-bridge', 'right', 'Nắp');
    }

    return nodes;
  },
};
