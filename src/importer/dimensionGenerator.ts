// Bộ sinh chuỗi kích thước kỹ thuật (DIM) cho khuôn bế nhập ngoài khi co giãn thông minh
import type { DimensionLine } from '../render2d/dimensions';
import type { DetectedBoxStructure } from './types';

/**
 * Tự động tạo chuỗi đường đo kích thước chi tiết (ngang: lưỡi dán + 4 cột thân + tổng ngang, dọc: nắp + thân + đáy + tổng dọc)
 * chuẩn quy cách bản vẽ kỹ thuật AutoCAD bao bì
 */
export function generateImportedDimensions(
  s: DetectedBoxStructure,
  targetL: number,
  targetW: number,
  targetH: number,
  dielineBbox: [number, number, number, number]
): DimensionLine[] {
  const lines: DimensionLine[] = [];
  const [minX, minY, width, height] = dielineBbox;
  const maxX = minX + width;
  const maxY = minY + height;

  // Tính toạ độ X của các cột
  const x0 = minX;
  const x1 = minX + s.glueWidth;
  const x2 = x1 + targetL;
  const x3 = x2 + targetW;
  const x4 = x3 + targetL;
  const x5 = maxX;

  // Tính toạ độ Y của các vùng
  const y0 = minY;
  let y1 = s.yTop;
  let y2 = s.yTop + targetH;
  let y3 = maxY;

  if (s.isRSCFlap) {
    const flapH = targetW / 2;
    y1 = y0 + flapH;
    y2 = y1 + targetH;
    y3 = y2 + flapH;
  }

  const tickLen = 2.5;

  function addHorizDim(xStart: number, xEnd: number, yPos: number, label: string) {
    const xm = (xStart + xEnd) / 2;
    // Đường đo chính
    lines.push({
      start: [xStart, yPos],
      end: [xEnd, yPos],
      label,
      mid: [xm, yPos - 3],
    });
    // 2 vạch chéo 45 độ chuẩn CAD
    lines.push({
      start: [xStart - tickLen, yPos + tickLen],
      end: [xStart + tickLen, yPos - tickLen],
      label: '',
      mid: [xStart, yPos],
    });
    lines.push({
      start: [xEnd - tickLen, yPos + tickLen],
      end: [xEnd + tickLen, yPos - tickLen],
      label: '',
      mid: [xEnd, yPos],
    });
    // Đường dóng từ mép khuôn lên đường đo
    lines.push({
      start: [xStart, y0],
      end: [xStart, yPos - 2],
      label: '',
      mid: [xStart, y0],
    });
    lines.push({
      start: [xEnd, y0],
      end: [xEnd, yPos - 2],
      label: '',
      mid: [xEnd, y0],
    });
  }

  function addVertDim(yStart: number, yEnd: number, xPos: number, label: string) {
    const ym = (yStart + yEnd) / 2;
    // Đường đo chính
    lines.push({
      start: [xPos, yStart],
      end: [xPos, yEnd],
      label,
      mid: [xPos + 4, ym],
    });
    // 2 vạch chéo 45 độ chuẩn CAD
    lines.push({
      start: [xPos - tickLen, yStart + tickLen],
      end: [xPos + tickLen, yStart - tickLen],
      label: '',
      mid: [xPos, yStart],
    });
    lines.push({
      start: [xPos - tickLen, yEnd + tickLen],
      end: [xPos + tickLen, yEnd - tickLen],
      label: '',
      mid: [xPos, yEnd],
    });
    // Đường dóng từ mép khuôn sang đường đo
    lines.push({
      start: [maxX, yStart],
      end: [xPos + 2, yStart],
      label: '',
      mid: [maxX, yStart],
    });
    lines.push({
      start: [maxX, yEnd],
      end: [xPos + 2, yEnd],
      label: '',
      mid: [maxX, yEnd],
    });
  }

  // 1. Chuỗi kích thước chi tiết ngang (Top Chain 1) - đặt cách mép trên 12mm
  const yDim1 = y0 - 12;
  addHorizDim(x0, x1, yDim1, `${Math.round(s.glueWidth)}`);
  addHorizDim(x1, x2, yDim1, `${Math.round(targetL)}`);
  addHorizDim(x2, x3, yDim1, `${Math.round(targetW)}`);
  addHorizDim(x3, x4, yDim1, `${Math.round(targetL)}`);
  addHorizDim(x4, x5, yDim1, `${Math.round(targetW)}`);

  // 2. Kích thước tổng ngang (Top Chain 2) - đặt cách mép trên 26mm
  const yDim2 = y0 - 26;
  const totalW = Math.round(maxX - minX);
  lines.push({
    start: [x0, yDim2],
    end: [x5, yDim2],
    label: `${totalW}`,
    mid: [(x0 + x5) / 2, yDim2 - 3],
  });
  lines.push({
    start: [x0 - tickLen, yDim2 + tickLen],
    end: [x0 + tickLen, yDim2 - tickLen],
    label: '',
    mid: [x0, yDim2],
  });
  lines.push({
    start: [x5 - tickLen, yDim2 + tickLen],
    end: [x5 + tickLen, yDim2 - tickLen],
    label: '',
    mid: [x5, yDim2],
  });
  lines.push({
    start: [x0, yDim1],
    end: [x0, yDim2 - 2],
    label: '',
    mid: [x0, yDim1],
  });
  lines.push({
    start: [x5, yDim1],
    end: [x5, yDim2 - 2],
    label: '',
    mid: [x5, yDim1],
  });

  // 3. Chuỗi kích thước chi tiết dọc (Right Chain 1) - đặt cách mép phải 14mm
  const xDim1 = maxX + 14;
  const topFlapH = Math.round(y1 - y0);
  const bottomFlapH = Math.round(y3 - y2);
  if (topFlapH > 5) {
    addVertDim(y0, y1, xDim1, `${topFlapH}`);
  }
  addVertDim(y1, y2, xDim1, `${Math.round(targetH)}`);
  if (bottomFlapH > 5) {
    addVertDim(y2, y3, xDim1, `${bottomFlapH}`);
  }

  // 4. Kích thước tổng dọc (Right Chain 2) - đặt cách mép phải 28mm
  const xDim2 = maxX + 28;
  const totalH = Math.round(maxY - minY);
  lines.push({
    start: [xDim2, y0],
    end: [xDim2, y3],
    label: `${totalH}`,
    mid: [xDim2 + 4, (y0 + y3) / 2],
  });
  lines.push({
    start: [xDim2 - tickLen, y0 + tickLen],
    end: [xDim2 + tickLen, y0 - tickLen],
    label: '',
    mid: [xDim2, y0],
  });
  lines.push({
    start: [xDim2 - tickLen, y3 + tickLen],
    end: [xDim2 + tickLen, y3 - tickLen],
    label: '',
    mid: [xDim2, y3],
  });
  lines.push({
    start: [xDim1, y0],
    end: [xDim2 + 2, y0],
    label: '',
    mid: [xDim1, y0],
  });
  lines.push({
    start: [xDim1, y3],
    end: [xDim2 + 2, y3],
    label: '',
    mid: [xDim1, y3],
  });

  return lines;
}
