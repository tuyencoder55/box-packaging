// Vẽ chuỗi kích thước chi tiết và kích thước phủ bì chuẩn CAD kỹ thuật bao bì
import type { DimMark, Pt } from '../core/types';
import type { LayoutPanel } from '../core/layout';
import { formatDimValue, type Unit } from '../core/units';

export interface DimensionLine {
  start: Pt;
  end: Pt;
  label: string;
  mid: Pt;
}

interface RawDimsInput {
  l: number;
  w: number;
  h: number;
  t?: number;
  opts?: Record<string, string | boolean | number>;
}

/**
 * Tạo một đường đo kích thước hoàn chỉnh gồm đường dóng, vạch giới hạn và nhãn số
 */
function createDimSegment(
  p1: Pt,
  p2: Pt,
  label: string,
  dir: 'horizontal' | 'vertical',
  lines: DimensionLine[],
  textOffset = 4
) {
  // 1. Đường đo kích thước chính
  let mid: Pt;
  if (dir === 'horizontal') {
    mid = [(p1[0] + p2[0]) / 2, p1[1] - textOffset];
  } else {
    mid = [p1[0] + textOffset + 2, (p1[1] + p2[1]) / 2];
  }

  lines.push({
    start: [p1[0], p1[1]],
    end: [p2[0], p2[1]],
    label,
    mid,
  });

  // 2. Vạch chéo giới hạn đầu mút (Tick mark 45° chuẩn CAD)
  const tickLen = 2;
  if (dir === 'horizontal') {
    lines.push({
      start: [p1[0] - tickLen, p1[1] + tickLen],
      end: [p1[0] + tickLen, p1[1] - tickLen],
      label: '',
      mid: p1,
    });
    lines.push({
      start: [p2[0] - tickLen, p2[1] + tickLen],
      end: [p2[0] + tickLen, p2[1] - tickLen],
      label: '',
      mid: p2,
    });
  } else {
    lines.push({
      start: [p1[0] - tickLen, p1[1] + tickLen],
      end: [p1[0] + tickLen, p1[1] - tickLen],
      label: '',
      mid: p1,
    });
    lines.push({
      start: [p2[0] - tickLen, p2[1] + tickLen],
      end: [p2[0] + tickLen, p2[1] - tickLen],
      label: '',
      mid: p2,
    });
  }
}

/**
 * Thêm đường gióng nối từ cạnh phôi ra đường kích thước
 */
function createExtensionLine(from: Pt, to: Pt, lines: DimensionLine[]) {
  lines.push({
    start: [from[0], from[1]],
    end: [to[0], to[1]],
    label: '',
    mid: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
  });
}

/**
 * Tính toán toàn bộ chuỗi kích thước CAD chi tiết và kích thước phủ bì tổng thể cho tất cả các loại hộp
 */
export function buildDimensionLines(
  _dims: DimMark[],
  layouts: LayoutPanel[],
  rawDims: RawDimsInput,
  unit: Unit,
  boxId?: string
): DimensionLine[] {
  if (layouts.length === 0) return [];

  const lines: DimensionLine[] = [];
  const layoutMap = new Map(layouts.map((l) => [l.node.id, l]));

  // Tính bbox toàn bộ
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const l of layouts) {
    for (const [x, y] of l.poly) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const { l, w, h, t = 3, opts = {} } = rawDims;

  // 1. Nhóm thùng carton tiêu chuẩn (FEFCO 0201) & Thùng nắp chồm (FEFCO 0203)
  if (boxId === 'fefco-0201' || boxId === 'fefco-0203' || layoutMap.has('panel-a')) {
    const g = Number(opts.glueWidth ?? 35);
    const defaultSlot = t > 3 ? 8 : 6;
    const s = Math.max(0, Number(opts.slotWidth ?? defaultSlot));
    const isFOL = boxId === 'fefco-0203';
    const flapTop = isFOL ? w : w / 2;
    const flapBot = isFOL ? w : w / 2;

    const yDimChain = -flapTop - 12; // Hàng 1: Chuỗi kích thước chi tiết
    const yDimTotal = yDimChain - 18; // Hàng 2: Kích thước phủ bì tổng thể
    const xDimChain = maxX + 14; // Cột 1: Chuỗi kích thước dọc chi tiết
    const xDimTotal = xDimChain + 20; // Cột 2: Kích thước phủ bì chiều cao

    // --- CHUỖI NGANG (Horizontal Chain) ---
    // Các mốc: Tai dán (-g -> 0), Mặt A (0 -> l), Mặt B (l -> l+w), Mặt C (l+w -> 2l+w), Mặt D (2l+w -> 2l+2w)
    const xPoints = [
      { x: -g, label: 'Tai dán' },
      { x: 0, label: 'A' },
      { x: l, label: 'B' },
      { x: l + w, label: 'C' },
      { x: 2 * l + w, label: 'D' },
      { x: 2 * l + 2 * w, label: 'Hết' },
    ];

    // Đo từng đoạn chuỗi
    for (let i = 0; i < xPoints.length - 1; i++) {
      const x1 = xPoints[i].x;
      const x2 = xPoints[i + 1].x;
      const segLen = Math.round(x2 - x1);
      createDimSegment([x1, yDimChain], [x2, yDimChain], formatDimValue(segLen, unit), 'horizontal', lines);
      // Đường gióng từ mép trên hộp lên đường đo
      createExtensionLine([x1, -flapTop + 2], [x1, yDimChain - 2], lines);
    }
    createExtensionLine([xPoints[xPoints.length - 1].x, -flapTop + 2], [xPoints[xPoints.length - 1].x, yDimChain - 2], lines);

    // Kích thước phủ bì tổng thể chiều dài
    const totalW = Math.round(g + 2 * l + 2 * w);
    createDimSegment([-g, yDimTotal], [2 * l + 2 * w, yDimTotal], formatDimValue(totalW, unit), 'horizontal', lines);
    createExtensionLine([-g, yDimChain - 2], [-g, yDimTotal - 2], lines);
    createExtensionLine([2 * l + 2 * w, yDimChain - 2], [2 * l + 2 * w, yDimTotal - 2], lines);

    // Hiển thị kích thước khe rãnh xẻ (Slot width) nếu s > 0
    if (s > 0) {
      const slotCenters = [l, l + w, 2 * l + w];
      for (const cx of slotCenters) {
        const sx1 = cx - s / 2;
        const sx2 = cx + s / 2;
        const ySlotDim = -flapTop / 2;
        createDimSegment([sx1, ySlotDim], [sx2, ySlotDim], formatDimValue(s, unit), 'horizontal', lines, 3);
      }
    }

    // --- CHUỖI DỌC (Vertical Chain bên phải) ---
    // Các mốc: Đỉnh nắp trên (-flapTop), Cấn nắp trên (0), Cấn nắp dưới (h), Đáy nắp dưới (h + flapBot)
    const yPoints = [
      { y: -flapTop, val: Math.round(flapTop) },
      { y: 0, val: Math.round(h) },
      { y: h, val: Math.round(flapBot) },
      { y: h + flapBot, val: 0 },
    ];

    for (let j = 0; j < yPoints.length - 1; j++) {
      const y1 = yPoints[j].y;
      const y2 = yPoints[j + 1].y;
      const segLen = Math.round(y2 - y1);
      createDimSegment([xDimChain, y1], [xDimChain, y2], formatDimValue(segLen, unit), 'vertical', lines);
      // Đường gióng ngang từ mép phải hộp sang
      createExtensionLine([maxX - 2, y1], [xDimChain + 2, y1], lines);
    }
    createExtensionLine([maxX - 2, yPoints[yPoints.length - 1].y], [xDimChain + 2, yPoints[yPoints.length - 1].y], lines);

    // Kích thước phủ bì tổng thể chiều cao
    const totalH = Math.round(flapTop + h + flapBot);
    createDimSegment([xDimTotal, -flapTop], [xDimTotal, h + flapBot], formatDimValue(totalH, unit), 'vertical', lines);
    createExtensionLine([xDimChain + 2, -flapTop], [xDimTotal + 2, -flapTop], lines);
    createExtensionLine([xDimChain + 2, h + flapBot], [xDimTotal + 2, h + flapBot], lines);

    return lines;
  }

  // 2. Thùng âm dương (FEFCO 0301 / Hộp nắp đáy)
  if (boxId === 'fefco-0301' || layoutMap.has('tray-base-face') || layoutMap.has('tray-lid-face')) {
    const defaultSlot = t > 3 ? 8 : 6;
    const s = Math.max(0, Number(opts.slotWidth ?? defaultSlot));

    // Thu thập các phôi (Nắp và/hoặc Đáy)
    const parts: Array<{ prefix: string; label: string }> = [];
    if (layoutMap.has('tray-lid-face')) parts.push({ prefix: 'tray-lid', label: 'NẮP' });
    if (layoutMap.has('tray-base-face')) parts.push({ prefix: 'tray-base', label: 'ĐÁY' });

    for (const part of parts) {
      const face = layoutMap.get(`${part.prefix}-face`);
      if (!face) continue;

      const [fx, fy, fw, fh] = face.rect;
      const wallTop = layoutMap.get(`${part.prefix}-wall-top`);
      const hVal = wallTop ? wallTop.node.depth : h;

      const pMinX = fx - hVal;
      const pMaxX = fx + fw + hVal;
      const pMinY = fy - hVal;
      const pMaxY = fy + fh + hVal;

      const yChain = pMinY - 12;
      const yTotal = yChain - 18;
      const xChain = pMaxX + 14;
      const xTotal = xChain + 20;

      // Chuỗi ngang: Tai góc trái (hVal) + Thân (fw) + Tai góc phải (hVal)
      createDimSegment([pMinX, yChain], [fx, yChain], formatDimValue(hVal, unit), 'horizontal', lines);
      createExtensionLine([pMinX, pMinY + 2], [pMinX, yChain - 2], lines);
      createExtensionLine([fx, pMinY + 2], [fx, yChain - 2], lines);

      createDimSegment([fx, yChain], [fx + fw, yChain], formatDimValue(fw, unit), 'horizontal', lines);
      createExtensionLine([fx + fw, pMinY + 2], [fx + fw, yChain - 2], lines);

      createDimSegment([fx + fw, yChain], [pMaxX, yChain], formatDimValue(hVal, unit), 'horizontal', lines);
      createExtensionLine([pMaxX, pMinY + 2], [pMaxX, yChain - 2], lines);

      // Phủ bì dài phôi
      const totalPartW = Math.round(fw + 2 * hVal);
      createDimSegment([pMinX, yTotal], [pMaxX, yTotal], formatDimValue(totalPartW, unit), 'horizontal', lines);
      createExtensionLine([pMinX, yChain - 2], [pMinX, yTotal - 2], lines);
      createExtensionLine([pMaxX, yChain - 2], [pMaxX, yTotal - 2], lines);

      // Chuỗi dọc: Thành trên (hVal) + Thân (fh) + Thành dưới (hVal)
      createDimSegment([xChain, pMinY], [xChain, fy], formatDimValue(hVal, unit), 'vertical', lines);
      createExtensionLine([pMaxX - 2, pMinY], [xChain + 2, pMinY], lines);
      createExtensionLine([pMaxX - 2, fy], [xChain + 2, fy], lines);

      createDimSegment([xChain, fy], [xChain, fy + fh], formatDimValue(fh, unit), 'vertical', lines);
      createExtensionLine([pMaxX - 2, fy + fh], [xChain + 2, fy + fh], lines);

      createDimSegment([xChain, fy + fh], [xChain, pMaxY], formatDimValue(hVal, unit), 'vertical', lines);
      createExtensionLine([pMaxX - 2, pMaxY], [xChain + 2, pMaxY], lines);

      // Phủ bì rộng phôi
      const totalPartH = Math.round(fh + 2 * hVal);
      createDimSegment([xTotal, pMinY], [xTotal, pMaxY], formatDimValue(totalPartH, unit), 'vertical', lines);
      createExtensionLine([xChain + 2, pMinY], [xTotal + 2, pMinY], lines);
      createExtensionLine([xChain + 2, pMaxY], [xTotal + 2, pMaxY], lines);

      // Đo kích thước rãnh chạp ở 4 góc nếu có
      if (s > 0) {
        const slotY1 = fy;
        const slotY2 = fy + fh;
        createDimSegment([fx - s / 2, slotY1], [fx + s / 2, slotY1], formatDimValue(s, unit), 'horizontal', lines, 3);
        createDimSegment([fx + fw - s / 2, slotY1], [fx + fw + s / 2, slotY1], formatDimValue(s, unit), 'horizontal', lines, 3);
        createDimSegment([fx - s / 2, slotY2], [fx + s / 2, slotY2], formatDimValue(s, unit), 'horizontal', lines, 3);
        createDimSegment([fx + fw - s / 2, slotY2], [fx + fw + s / 2, slotY2], formatDimValue(s, unit), 'horizontal', lines, 3);
      }
    }

    return lines;
  }

  // 3. Fallback thông minh tổng quát cho các loại hộp khác (FEFCO 0427, Tuck End, Auto-Lock...)
  // Thu thập các đường nếp cấn (crease lines) để xác định các tọa độ chia khoang chuẩn xác
  const xCoords = new Set<number>([minX, maxX]);
  const yCoords = new Set<number>([minY, maxY]);

  for (const layout of layouts) {
    xCoords.add(layout.rect[0]);
    xCoords.add(layout.rect[0] + layout.rect[2]);
    yCoords.add(layout.rect[1]);
    yCoords.add(layout.rect[1] + layout.rect[3]);
  }

  // Sắp xếp và lọc các mốc cách nhau tối thiểu 8mm để tránh trùng lặp
  const sortedX = Array.from(xCoords).sort((a, b) => a - b).filter((val, idx, arr) => idx === 0 || val - arr[idx - 1] > 6);
  const sortedY = Array.from(yCoords).sort((a, b) => a - b).filter((val, idx, arr) => idx === 0 || val - arr[idx - 1] > 6);

  const yDimChain = minY - 12;
  const yDimTotal = yDimChain - 18;
  const xDimChain = maxX + 14;
  const xDimTotal = xDimChain + 20;

  // Chuỗi ngang
  for (let i = 0; i < sortedX.length - 1; i++) {
    const x1 = sortedX[i];
    const x2 = sortedX[i + 1];
    const segLen = Math.round(x2 - x1);
    if (segLen >= 8) {
      createDimSegment([x1, yDimChain], [x2, yDimChain], formatDimValue(segLen, unit), 'horizontal', lines);
      createExtensionLine([x1, minY + 2], [x1, yDimChain - 2], lines);
    }
  }
  createExtensionLine([maxX, minY + 2], [maxX, yDimChain - 2], lines);

  // Phủ bì ngang
  const totalW = Math.round(maxX - minX);
  createDimSegment([minX, yDimTotal], [maxX, yDimTotal], formatDimValue(totalW, unit), 'horizontal', lines);
  createExtensionLine([minX, yDimChain - 2], [minX, yDimTotal - 2], lines);
  createExtensionLine([maxX, yDimChain - 2], [maxX, yDimTotal - 2], lines);

  // Chuỗi dọc
  for (let j = 0; j < sortedY.length - 1; j++) {
    const y1 = sortedY[j];
    const y2 = sortedY[j + 1];
    const segLen = Math.round(y2 - y1);
    if (segLen >= 8) {
      createDimSegment([xDimChain, y1], [xDimChain, y2], formatDimValue(segLen, unit), 'vertical', lines);
      createExtensionLine([maxX - 2, y1], [xDimChain + 2, y1], lines);
    }
  }
  createExtensionLine([maxX - 2, maxY], [xDimChain + 2, maxY], lines);

  // Phủ bì dọc
  const totalH = Math.round(maxY - minY);
  createDimSegment([xDimTotal, minY], [xDimTotal, maxY], formatDimValue(totalH, unit), 'vertical', lines);
  createExtensionLine([xDimChain + 2, minY], [xDimTotal + 2, minY], lines);
  createExtensionLine([xDimChain + 2, maxY], [xDimTotal + 2, maxY], lines);

  return lines;
}
