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

    // 1 thân Back + 1 lưỡi dán + 3 thân (Left, Front, Right) + 4 nắp trên + 4 nắp đáy = 13 panels
    expect(nodes).toHaveLength(13);

    const root = nodes.find((n) => n.parent === null);
    expect(root).toBeDefined();
    expect(root?.id).toBe('panel-back');

    // Mặt trước có lỗ cắt oval mở hộp
    const front = nodes.find((n) => n.id === 'panel-front');
    expect(front?.holes).toBeDefined();
    expect(front?.holes?.length).toBeGreaterThan(0);
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

    const [, , totalW] = dieline.bbox;

    // Chiều rộng: glue (15) + Back (230) + Left (115) + Front (230) + Right (115) = 705
    expect(totalW).toBeCloseTo(15 + 230 * 2 + 115 * 2, 1);
  });
});
