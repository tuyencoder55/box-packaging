// Định nghĩa loại hộp: Thùng âm dương / Hộp nắp đáy carton FEFCO 0301 (Slotted Tray Lid & Base)
// Chuẩn sản xuất xưởng bao bì carton: Tấm phôi nguyên hình chữ nhật, xẻ 4 góc tạo tai bấm ghim/dán keo
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const fefco0301: BoxDef = {
  id: 'fefco-0301',
  name: 'Thùng âm dương (Nắp đáy rời)',
  code: 'FEFCO 0301',
  category: 'carton',
  defaults: {
    l: 400,
    w: 300,
    h: 120,
    t: 3,
  },
  options: [
    {
      key: 'part',
      label: 'Chi tiết hiển thị',
      type: 'select',
      choices: [
        { value: 'both', label: '1. Cả Bộ Nắp & Đáy (Chuẩn xưởng)' },
        { value: 'base', label: '2. Chỉ Thùng Đáy (ĐÁY)' },
        { value: 'lid', label: '3. Chỉ Thùng Nắp (NẮP)' },
      ],
      default: 'both',
    },
    {
      key: 'lidHeight',
      label: 'Chiều cao thành nắp',
      type: 'number',
      default: 120,
      min: 30,
      max: 400,
    },
    {
      key: 'clearance',
      label: 'Độ hở lồng nắp',
      type: 'number',
      default: 10,
      min: 2,
      max: 25,
    },
  ],
  dims: [
    { panelId: 'tray-base-face', axis: 'u', param: 'l' },
    { panelId: 'tray-base-face', axis: 'v', param: 'w' },
    { panelId: 'tray-base-wall-top', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h, t } = p;
    const part = String(p.opts?.part ?? 'both');
    const clearance = Number(p.opts?.clearance ?? (t > 4 ? 12 : 10));
    // Chiều cao thành nắp: mặc định bằng chiều cao đáy h (hoặc theo tùy chọn lidHeight)
    const hLid = Number(p.opts?.lidHeight ?? h);

    // Kích thước nắp tự động tính bù theo kích thước đáy:
    // Chiều dài nắp nhỉnh hơn (clearance * 1.5 để nắp trùm êm)
    // Chiều rộng nắp nhỉnh hơn clearance
    const lLid = Math.round(l + clearance * 1.4);
    const wLid = Math.round(w + clearance);

    const nodes: PanelNode[] = [];

    /**
     * Dựng 1 khay carton nguyên tấm chữ nhật (có 4 đường xẻ chạp ở 4 góc)
     */
    function createSlottedTray(
      prefix: string,
      length: number,
      width: number,
      height: number,
      slitDir: 'vertical' | 'horizontal',
      parentId: string | null = null,
      attachEdge?: 'top' | 'right' | 'bottom' | 'left',
      labelName = 'Khay'
    ) {
      // 1. Mặt đáy chính của khay
      nodes.push({
        id: `tray-${prefix}-face`,
        parent: parentId,
        edge: attachEdge,
        len: length,
        depth: width,
        fold: 0,
        step: 0,
        label: `Mặt ${labelName}`,
      });

      // 2. Thành trên
      nodes.push({
        id: `tray-${prefix}-wall-top`,
        parent: `tray-${prefix}-face`,
        edge: 'top',
        len: length,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành trên`,
      });

      // 3. Thành dưới
      nodes.push({
        id: `tray-${prefix}-wall-bottom`,
        parent: `tray-${prefix}-face`,
        edge: 'bottom',
        len: length,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành dưới`,
      });

      // 4. Thành trái
      nodes.push({
        id: `tray-${prefix}-wall-left`,
        parent: `tray-${prefix}-face`,
        edge: 'left',
        len: width,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành trái`,
      });

      // 5. Thành phải
      nodes.push({
        id: `tray-${prefix}-wall-right`,
        parent: `tray-${prefix}-face`,
        edge: 'right',
        len: width,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành phải`,
      });

      // 6. 4 góc vuông (Tai bấm ghim / dán keo)
      if (slitDir === 'vertical') {
        // Xẻ dọc: 4 góc vuông H × H gắn vào thành trái & thành phải (Chuẩn Nắp)
        nodes.push({
          id: `tray-${prefix}-corner-tl`,
          parent: `tray-${prefix}-wall-left`,
          edge: 'top',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc TL`,
          glue: true,
        });

        nodes.push({
          id: `tray-${prefix}-corner-bl`,
          parent: `tray-${prefix}-wall-left`,
          edge: 'bottom',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc BL`,
          glue: true,
        });

        nodes.push({
          id: `tray-${prefix}-corner-tr`,
          parent: `tray-${prefix}-wall-right`,
          edge: 'top',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc TR`,
          glue: true,
        });

        nodes.push({
          id: `tray-${prefix}-corner-br`,
          parent: `tray-${prefix}-wall-right`,
          edge: 'bottom',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc BR`,
          glue: true,
        });
      } else {
        // Xẻ ngang: 4 góc vuông H × H gắn vào thành trên & thành dưới (Chuẩn Đáy)
        nodes.push({
          id: `tray-${prefix}-corner-tl`,
          parent: `tray-${prefix}-wall-top`,
          edge: 'left',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc TL`,
          glue: true,
        });

        nodes.push({
          id: `tray-${prefix}-corner-tr`,
          parent: `tray-${prefix}-wall-top`,
          edge: 'right',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc TR`,
          glue: true,
        });

        nodes.push({
          id: `tray-${prefix}-corner-bl`,
          parent: `tray-${prefix}-wall-bottom`,
          edge: 'left',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc BL`,
          glue: true,
        });

        nodes.push({
          id: `tray-${prefix}-corner-br`,
          parent: `tray-${prefix}-wall-bottom`,
          edge: 'right',
          len: height,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc BR`,
          glue: true,
        });
      }
    }

    if (part === 'base') {
      // Chỉ Thùng Đáy
      createSlottedTray('base', l, w, h, 'horizontal', null, undefined, 'Đáy');
    } else if (part === 'lid') {
      // Chỉ Thùng Nắp
      createSlottedTray('base', lLid, wLid, hLid, 'vertical', null, undefined, 'Nắp');
    } else {
      // Cả Bộ Nắp & Đáy: Thùng Nắp ở trên, Thùng Đáy ở dưới (Chuẩn bản vẽ xưởng)
      // Thùng Nắp (NAP) ở trên
      createSlottedTray('lid', lLid, wLid, hLid, 'vertical', null, undefined, 'NẮP');

      // Khoảng đệm phân cách cắt rời giữa 2 phôi
      const gapDist = 30; // Khoảng cách 30mm giữa 2 tấm
      nodes.push({
        id: 'tray-separator-bridge',
        parent: 'tray-lid-wall-bottom',
        edge: 'bottom',
        len: lLid,
        depth: gapDist,
        fold: 0,
        step: 0,
        label: 'Khoảng phân cách',
      });

      // Thùng Đáy (DAY) ở dưới, thẳng hàng và song song với Thùng Nắp
      createSlottedTray('base', l, w, h, 'horizontal', 'tray-separator-bridge', 'bottom', 'ĐÁY');
    }

    return nodes;
  },
};
