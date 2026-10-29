import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { cubeTissueBox } from './cube-tissue-box';

describe('cubeTissueBox', () => {
  it('tạo đúng số lượng panel và cấu trúc cây', () => {
    const params = {
      l: 112,
      w: 112,
      h: 132,
      t: 0.5,
      opts: { glueWidth: 15 },
    };
    const nodes = cubeTissueBox.build(params);

    // 1 thân A + 1 lưỡi dán + 3 thân (B, C, D) + 4 nắp trên + 4 nắp đáy = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-a');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const params = {
      l: 112,
      w: 112,
      h: 132,
      t: 0.5,
      opts: { glueWidth: 15 },
    };
    const nodes = cubeTissueBox.build(params);
    const layout = layoutPanels(nodes);
    const dieline = buildDieline(layout);

    expect(dieline.polys.length).toBe(13);
    expect(dieline.crease.length).toBeGreaterThan(0);
    expect(dieline.cut.length).toBeGreaterThan(0);

    const [, , totalW, totalH] = dieline.bbox;

    // Chiều rộng: glue (15) + A (112) + B (112) + C (112) + D (112) = 463
    expect(totalW).toBeCloseTo(15 + 112 * 2 + 112 * 2, 1);
    // Chiều cao: top flap (56) + body (132) + bot flap (56) = 244
    expect(totalH).toBeCloseTo(56 + 132 + 56, 1);
  });
});
