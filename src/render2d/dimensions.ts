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

  // Nhóm các dim theo panelId để kiểm tra xem panel đó có nhiều dim (u và v) hay không
  const panelDimsCount = new Map<string, { hasU: boolean; hasV: boolean }>();
  for (const d of dims) {
    const cur = panelDimsCount.get(d.panelId) ?? { hasU: false, hasV: false };
    if (d.axis === 'u') cur.hasU = true;
    if (d.axis === 'v') cur.hasV = true;
    panelDimsCount.set(d.panelId, cur);
  }

  for (const dim of dims) {
    const layout = layoutMap.get(dim.panelId);
    if (!layout) continue;

    const [px, py, pw, ph] = layout.rect;
    const valMm = rawDims[dim.param];
    const displayVal = formatUnit(mmToUnit(valMm, unit), unit);
    const flags = panelDimsCount.get(dim.panelId);
    const bothAxes = Boolean(flags?.hasU && flags?.hasV);

    if (dim.axis === 'u') {
      // Nếu panel có cả 2 trục u và v: dịch trục u lên phía 38% chiều cao panel để tránh giao nhau ở giữa
      const yMid = bothAxes ? py + ph * 0.38 : py + ph / 2;
      const start: Pt = [px + 4, yMid];
      const end: Pt = [px + pw - 4, yMid];
      lines.push({
        start,
        end,
        label: displayVal,
        mid: [px + pw / 2, yMid - 6],
      });
    } else {
      // Trục v (dọc):
      // Nếu panel có cả 2 trục u và v: dịch trục v sang 38% chiều rộng panel
      // và nhãn text đặt ở 68% chiều cao panel để tách biệt hoàn toàn khỏi nhãn trục u
      const xMid = bothAxes ? px + pw * 0.38 : px + pw / 2;
      const start: Pt = [xMid, py + 4];
      const end: Pt = [xMid, py + ph - 4];
      const textY = bothAxes ? py + ph * 0.68 : py + ph / 2;
      lines.push({
        start,
        end,
        label: displayVal,
        mid: [xMid + 8, textY],
      });
    }
  }

  return lines;
}
