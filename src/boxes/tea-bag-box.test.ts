import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { teaBagBox, teaBox } from './tea-bag-box';

describe('teaBagBox', () => {
  it('tạo đúng số lượng panel và cấu trúc cây', () => {
    const params = {
      l: 140,
      w: 70,
      h: 76,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    };
    const nodes = teaBox.build(params);

    // 1 thân Back + 1 lưỡi dán + 3 thân (Left, Front, Right) + 4 nắp trên (lid, tuck, 2 dust) + 4 nắp đáy = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-back');
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

    const [, , totalW] = dieline.bbox;

    // Chiều rộng: glue (15) + Back (140) + Left (70) + Front (140) + Right (70) = 435
    expect(totalW).toBeCloseTo(15 + 140 * 2 + 70 * 2, 1);
  });
});
