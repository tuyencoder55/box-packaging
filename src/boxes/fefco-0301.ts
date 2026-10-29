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
    {
      key: 'slotWidth',
      label: 'Độ rộng rãnh xẻ (Slot)',
      type: 'number',
      default: 6,
      min: 0,
      max: 15,
    },
  ],
  dims: [
    { panelId: 'tray-base-face', axis: 'u', param: 'l' },
    { panelId: 'tray-base-face', axis: 'v', param: 'w' },
    { panelId: 'tray-base-wall-top', axis: 'v', param: 'h' },
    { panelId: 'tray-lid-face', axis: 'u', param: 'l' },
    { panelId: 'tray-lid-face', axis: 'v', param: 'w' },
    { panelId: 'tray-lid-wall-top', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h, t } = p;
    const part = String(p.opts?.part ?? 'both');
    const clearance = Number(p.opts?.clearance ?? (t > 4 ? 12 : 10));
    // Chiều cao thành nắp: mặc định bằng chiều cao đáy h (hoặc theo tùy chọn lidHeight)
    const hLid = Number(p.opts?.lidHeight ?? h);

    // Độ rộng rãnh xẻ (Slot): mặc định 6mm cho carton 3 lớp (t <= 3mm), 8mm cho carton 5 lớp (t > 3mm)
    const defaultSlot = t > 3 ? 8 : 6;
    const s = Math.max(0, Number(p.opts?.slotWidth ?? defaultSlot));
    const halfS = s / 2;

    // Kích thước nắp tự động tính bù theo kích thước đáy:
    // Chiều dài nắp nhỉnh hơn (clearance * 1.4 để nắp trùm êm)
    // Chiều rộng nắp nhỉnh hơn clearance
    const lLid = Math.round(l + clearance * 1.4);
    const wLid = Math.round(w + clearance);

    const nodes: PanelNode[] = [];

    /**
     * Dựng 1 khay carton nguyên tấm chữ nhật (có 4 khe rãnh xẻ chạp slotWidth ở 4 góc)
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

      // 2. Thành trên và thành dưới
      // Nếu xẻ dọc: khe rãnh nằm ở 2 đầu thành trên & dưới (offset = halfS, len = length - s)
      // Nếu xẻ ngang: thành trên & dưới giữ nguyên chiều dài full
      const topBotOffset = slitDir === 'vertical' ? halfS : 0;
      const topBotLen = slitDir === 'vertical' ? Math.max(10, length - s) : length;

      nodes.push({
        id: `tray-${prefix}-wall-top`,
        parent: `tray-${prefix}-face`,
        edge: 'top',
        offset: topBotOffset,
        len: topBotLen,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành trên`,
      });

      nodes.push({
        id: `tray-${prefix}-wall-bottom`,
        parent: `tray-${prefix}-face`,
        edge: 'bottom',
        offset: topBotOffset,
        len: topBotLen,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành dưới`,
      });

      // 3. Thành trái và thành phải
      // Nếu xẻ ngang: khe rãnh nằm ở 2 đầu thành trái & phải (offset = halfS, len = width - s)
      // Nếu xẻ dọc: thành trái & phải giữ nguyên chiều dài full
      const leftRightOffset = slitDir === 'horizontal' ? halfS : 0;
      const leftRightLen = slitDir === 'horizontal' ? Math.max(10, width - s) : width;

      nodes.push({
        id: `tray-${prefix}-wall-left`,
        parent: `tray-${prefix}-face`,
        edge: 'left',
        offset: leftRightOffset,
        len: leftRightLen,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành trái`,
      });

      nodes.push({
        id: `tray-${prefix}-wall-right`,
        parent: `tray-${prefix}-face`,
        edge: 'right',
        offset: leftRightOffset,
        len: leftRightLen,
        depth: height,
        fold: 90,
        step: 1,
        label: `${labelName} - Thành phải`,
      });

      // 4. 4 góc vuông (Tai bấm ghim / dán keo) tạo khe rãnh rộng s chuẩn xác
      const tabLen = Math.max(10, height - halfS);

      if (slitDir === 'vertical') {
        // Xẻ dọc: 4 góc vuông gắn vào thành trái & thành phải (Chuẩn Nắp)
        nodes.push({
          id: `tray-${prefix}-corner-tl`,
          parent: `tray-${prefix}-wall-left`,
          edge: 'top',
          offset: 0,
          len: tabLen,
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
          offset: 0,
          len: tabLen,
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
          offset: halfS,
          len: tabLen,
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
          offset: halfS,
          len: tabLen,
          depth: height,
          fold: 90,
          step: 2,
          label: `${labelName} - Tai góc BR`,
          glue: true,
        });
      } else {
        // Xẻ ngang: 4 góc vuông gắn vào thành trên & thành dưới (Chuẩn Đáy)
        nodes.push({
          id: `tray-${prefix}-corner-tl`,
          parent: `tray-${prefix}-wall-top`,
          edge: 'left',
          offset: 0,
          len: tabLen,
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
          offset: 0,
          len: tabLen,
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
          offset: halfS,
          len: tabLen,
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
          offset: halfS,
          len: tabLen,
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
      createSlottedTray('lid', lLid, wLid, hLid, 'vertical', null, undefined, 'Nắp');
    } else {
      // Cả Bộ Nắp & Đáy: Thùng Nắp ở trên, Thùng Đáy ở dưới (Chuẩn bản vẽ xưởng)
      // 1. Thùng Nắp (NAP) ở trên
      createSlottedTray('lid', lLid, wLid, hLid, 'vertical', null, undefined, 'NẮP');

      // 2. Thùng Đáy (DAY) ở dưới (Tấm phôi rời độc lập, layoutPanels tự động xếp thẳng hàng phía dưới)
      createSlottedTray('base', l, w, h, 'horizontal', null, undefined, 'ĐÁY');
    }

    return nodes;
  },
};
