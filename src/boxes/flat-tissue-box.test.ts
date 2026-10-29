import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { flatTissueBox } from './flat-tissue-box';

describe('flatTissueBox', () => {
  it('tạo đúng số lượng panel và cấu trúc cây', () => {
    const params = {
      l: 230,
      w: 115,
      h: 70,
      t: 0.5,
      opts: { glueWidth: 15 },
    };
    const nodes = flatTissueBox.build(params);

    // 1 thân A + 1 lưỡi dán + 3 thân (B, C, D) + 4 nắp trên + 4 nắp đáy = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-a');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const params = {
      l: 230,
      w: 115,
      h: 70,
      t: 0.5,
      opts: { glueWidth: 15 },
    };
    const nodes = flatTissueBox.build(params);
    const layout = layoutPanels(nodes);
    const dieline = buildDieline(layout);

    expect(dieline.polys.length).toBe(13);
    expect(dieline.crease.length).toBeGreaterThan(0);
    expect(dieline.cut.length).toBeGreaterThan(0);

    const [, , totalW, totalH] = dieline.bbox;

    // flapH = Math.round(115 * 0.5) = 58
    // Chiều rộng: glue (15) + A (230) + B (115) + C (230) + D (115) = 705
    expect(totalW).toBeCloseTo(15 + 230 * 2 + 115 * 2, 1);
    // Chiều cao: top flap (58) + body (70) + bot flap (58) = 186
    expect(totalH).toBeCloseTo(58 + 70 + 58, 1);
  });
});
