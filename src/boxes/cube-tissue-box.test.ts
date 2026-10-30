import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { cubeTissueBox, tissueBox } from './cube-tissue-box';

describe('cubeTissueBox', () => {
  it('tạo đúng số lượng panel và cấu trúc cây', () => {
    const params = {
      l: 112,
      w: 112,
      h: 132,
      t: 0.5,
      opts: { glueWidth: 15 },
    };
    const nodes = tissueBox.build(params);

    // 1 thân Back + 1 lưỡi dán + 3 thân (Left, Front, Right) + 4 nắp trên + 4 nắp đáy = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-back');
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

    const [, , totalW] = dieline.bbox;

    // Chiều rộng: glue (15) + Back (112) + Left (112) + Front (112) + Right (112) = 463
    expect(totalW).toBeCloseTo(15 + 112 * 2 + 112 * 2, 1);
  });
});
