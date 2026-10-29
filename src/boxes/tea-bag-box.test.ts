import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { teaBagBox } from './tea-bag-box';

describe('teaBagBox', () => {
  it('tạo đúng số lượng panel và cấu trúc cây', () => {
    const params = {
      l: 140,
      w: 70,
      h: 76,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    };
    const nodes = teaBagBox.build(params);

    // 1 thân A + 1 lưỡi dán + 3 thân (B, C, D) + 4 nắp trên (lid, tuck, 2 dust) + 4 nắp đáy = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-a');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const params = {
      l: 140,
      w: 70,
      h: 76,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    };
    const nodes = teaBagBox.build(params);
    const layout = layoutPanels(nodes);
    const dieline = buildDieline(layout);

    expect(dieline.polys.length).toBe(13);
    expect(dieline.crease.length).toBeGreaterThan(0);
    expect(dieline.cut.length).toBeGreaterThan(0);

    const [, , totalW, totalH] = dieline.bbox;

    // Chiều rộng: glue (15) + A (140) + B (70) + C (140) + D (70) = 435
    expect(totalW).toBeCloseTo(15 + 140 * 2 + 70 * 2, 1);
    // Chiều cao: top lid+tuck (70 + 16 = 86) + body (76) + bot flap (35) = 197
    expect(totalH).toBeCloseTo(86 + 76 + 35, 1);
  });
});
