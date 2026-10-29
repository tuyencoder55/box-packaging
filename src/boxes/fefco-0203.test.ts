// Kiểm thử hình học thùng carton nắp chồm FEFCO 0203 trong src/boxes/fefco-0203.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { fefco0203 } from './fefco-0203';

describe('fefco-0203', () => {
  it('sinh đúng cấu trúc 13 panel và 12 đường cấn', () => {
    const nodes = fefco0203.build({
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

  it('hộp bao bbox khớp chính xác với tính toán nắp chồm W', () => {
    // Với L=300, W=200, H=150, glue=30:
    // Chiều ngang: glue (30) + A (300) + B (200) + C (300) + D (200) = 1030 mm
    // Chiều dọc: nắp trên chồm W (200) + thân (150) + nắp dưới chồm W (200) = 550 mm
    // Gốc (0,0) tại đỉnh trên-trái của panel A:
    // minX = -30, minY = -200, width = 1030, height = 550
    const nodes = fefco0203.build({
      l: 300,
      w: 200,
      h: 150,
      t: 3,
      opts: { glueWidth: 30 },
    });

    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    expect(dieline.bbox).toEqual([-30, -200, 1030, 550]);
  });

  it('cánh nắp chính A và C có depth bằng chiều rộng W', () => {
    const nodes = fefco0203.build({
      l: 250,
      w: 180,
      h: 120,
      t: 3,
      opts: {},
    });

    const topA = nodes.find((n) => n.id === 'top-flap-a');
    const topC = nodes.find((n) => n.id === 'top-flap-c');
    const topB = nodes.find((n) => n.id === 'top-flap-b');

    expect(topA?.depth).toBe(180);
    expect(topC?.depth).toBe(180);
    expect(topB?.depth).toBe(90); // tai phụ = W/2
  });
});
