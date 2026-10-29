import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { dispenserBox } from './dispenser-box';

describe('dispenserBox', () => {
  it('tạo đúng số lượng panel và cấu trúc cây', () => {
    const params = {
      l: 150,
      w: 75,
      h: 100,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    };
    const nodes = dispenserBox.build(params);

    // 1 thân A + 1 lưỡi dán + 3 thân (B, C, D) + 4 nắp trên (lid, tuck, 2 dust) + 4 nắp đáy (lid, tuck, 2 dust) = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-a');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const params = {
      l: 150,
      w: 75,
      h: 100,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    };
    const nodes = dispenserBox.build(params);
    const layout = layoutPanels(nodes);
    const dieline = buildDieline(layout);

    expect(dieline.polys.length).toBe(13);
    expect(dieline.crease.length).toBeGreaterThan(0);
    expect(dieline.cut.length).toBeGreaterThan(0);

    const [, , totalW, totalH] = dieline.bbox;

    // Chiều rộng: glue (15) + A (150) + B (75) + C (150) + D (75) = 465
    expect(totalW).toBeCloseTo(15 + 150 * 2 + 75 * 2, 1);
    // Chiều cao: top lid+tuck (75 + 16) + body (100) + bot lid+tuck (75 + 16) = 282
    expect(totalH).toBeCloseTo(100 + (75 + 16) * 2, 1);
  });
});
