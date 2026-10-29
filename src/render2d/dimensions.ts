// Vẽ đường kích thước và nhãn thông số trên khuôn 2D theo DimMark
import type { DimMark, Pt } from '../core/types';
import type { LayoutPanel } from '../core/layout';
import { formatUnit, mmToUnit, type Unit } from '../core/units';

export interface DimensionLine {
  start: Pt;
  end: Pt;
  label: string;
  mid: Pt;
}

/**
 * Tính toán các đường kích thước dựa trên cấu hình dims của hộp và layout
 */
export function buildDimensionLines(
  dims: DimMark[],
  layouts: LayoutPanel[],
  rawDims: { l: number; w: number; h: number },
  unit: Unit
): DimensionLine[] {
  const lines: DimensionLine[] = [];
  const layoutMap = new Map(layouts.map((l) => [l.node.id, l]));

  for (const dim of dims) {
    const layout = layoutMap.get(dim.panelId);
    if (!layout) continue;

    const [px, py, pw, ph] = layout.rect;
    const valMm = rawDims[dim.param];
    const displayVal = formatUnit(mmToUnit(valMm, unit), unit);

    if (dim.axis === 'u') {
      // Đường ngang ở giữa chiều cao của panel
      const yMid = py + ph / 2;
      const start: Pt = [px + 4, yMid];
      const end: Pt = [px + pw - 4, yMid];
      lines.push({
        start,
        end,
        label: displayVal,
        mid: [px + pw / 2, yMid - 6],
      });
    } else {
      // Đường dọc ở giữa chiều rộng của panel
      const xMid = px + pw / 2;
      const start: Pt = [xMid, py + 4];
      const end: Pt = [xMid, py + ph - 4];
      lines.push({
        start,
        end,
        label: displayVal,
        mid: [xMid + 8, py + ph / 2],
      });
    }
  }

  return lines;
}
