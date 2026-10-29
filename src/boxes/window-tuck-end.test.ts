import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { windowTuckEnd } from './window-tuck-end';

describe('windowTuckEnd', () => {
  it('tạo đúng số lượng panel và cấu trúc cây', () => {
    const params = {
      l: 100,
      w: 50,
      h: 150,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    };
    const nodes = windowTuckEnd.build(params);

    // 1 thân A + 1 lưỡi dán + 3 thân (B, C, D) + 4 nắp trên (lid, tuck, 2 dust) + 4 nắp đáy (lid, tuck, 2 dust) = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-a');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const params = {
      l: 100,
      w: 50,
      h: 150,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    };
    const nodes = windowTuckEnd.build(params);
    const layout = layoutPanels(nodes);
    const dieline = buildDieline(layout);

    expect(dieline.polys.length).toBe(13);
    expect(dieline.crease.length).toBeGreaterThan(0);
    expect(dieline.cut.length).toBeGreaterThan(0);

    const [, , totalW, totalH] = dieline.bbox;

    // Chiều rộng: glue (15) + A (100) + B (50) + C (100) + D (50) = 315
    expect(totalW).toBeCloseTo(15 + 100 * 2 + 50 * 2, 1);
    // Chiều cao: top lid+tuck (50 + 16) + body (150) + bot lid+tuck (50 + 16) = 282
    expect(totalH).toBeCloseTo(150 + (50 + 16) * 2, 1);
  });
});
