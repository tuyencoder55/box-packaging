// Kiểm thử hình học thùng carton FEFCO 0201 trong src/boxes/fefco-0201.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { fefco0201 } from './fefco-0201';

describe('fefco-0201', () => {
  it('sinh đúng cấu trúc 13 panel và 12 đường cấn', () => {
    const nodes = fefco0201.build({
      l: 300,
      w: 200,
      h: 150,
      t: 3,
      opts: {},
    });

    // 1 glue + 4 thân (A,B,C,D) + 4 nắp trên + 4 nắp dưới = 13 panels
    expect(nodes).toHaveLength(13);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(13);

    const dieline = buildDieline(layouts);
    // 13 panels -> 1 panel gốc + 12 panels con -> đúng 12 đường cấn
    expect(dieline.crease).toHaveLength(12);
  });

  it('hộp bao bbox khớp chính xác với tính toán hình học mẫu', () => {
    // Với L=300, W=200, H=150, glue=30:
    // Chiều ngang: glue (30) + A (300) + B (200) + C (300) + D (200) = 1030 mm
    // Chiều dọc: top flap (W/2 = 100) + thân (H = 150) + bot flap (W/2 = 100) = 350 mm
    // Gốc (0,0) tại đỉnh trên-trái của panel A:
    // minX = -30, minY = -100, width = 1030, height = 350
    const nodes = fefco0201.build({
      l: 300,
      w: 200,
      h: 150,
      t: 3,
      opts: { glueWidth: 30 },
    });

    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    expect(dieline.bbox).toEqual([-30, -100, 1030, 350]);
  });

  it('khoảng cách rãnh xẻ (slot) giữa các cánh nắp đúng bằng slotWidth', () => {
    const slotWidth = 8;
    const nodes = fefco0201.build({
      l: 300,
      w: 200,
      h: 150,
      t: 5,
      opts: { slotWidth },
    });

    const topA = nodes.find((n) => n.id === 'top-flap-a');
    const topB = nodes.find((n) => n.id === 'top-flap-b');

    expect(topA).toBeDefined();
    expect(topB).toBeDefined();

    // Nắp A kết thúc tại L - slotWidth/2 = 300 - 4 = 296
    // Nắp B bắt đầu tại slotWidth/2 = 4 (trên thân B rộng 200)
    // Tức là khoảng hở giữa 2 cánh nắp = (300 + 4) - 296 = 8 mm
    expect(topA?.len).toBe(300 - slotWidth / 2);
    expect(topB?.offset).toBe(slotWidth / 2);
    expect(topB?.len).toBe(200 - slotWidth);
  });
});
