// Kiểm thử hình học hộp nắp gài thẳng STE trong src/boxes/tuck-end-straight.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { tuckEndStraight } from './tuck-end-straight';

describe('tuck-end-straight', () => {
  it('sinh đúng cấu trúc 13 panel và 12 đường cấn', () => {
    const nodes = tuckEndStraight.build({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
      opts: {},
    });

    // 1 glue + 4 thân + 2 nắp + 2 lưỡi gài + 4 tai bụi = 13 panels
    expect(nodes).toHaveLength(13);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(13);

    const dieline = buildDieline(layouts);
    expect(dieline.crease).toHaveLength(12);
  });

  it('hộp bao bbox khớp đúng tính toán hình học', () => {
    const nodes = tuckEndStraight.build({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    });

    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    // Chiều ngang: glue (15) + A (80) + B (50) + C (80) + D (50) = 275 mm
    // minX = -15, width = 275
    expect(dieline.bbox[0]).toBe(-15);
    expect(dieline.bbox[2]).toBe(275);

    // Chiều dọc: trên mặt C: top lid (50) + tuck (16) = 66 mm phía trên -> minY = -66
    // Phía dưới: bot lid (50) + tuck (16) = 66 mm dưới -> maxY = 140 + 66 = 206 -> height = 272 mm
    expect(dieline.bbox[1]).toBe(-66);
    expect(dieline.bbox[3]).toBe(272);
  });
});
