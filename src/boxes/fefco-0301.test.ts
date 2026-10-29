// Kiểm thử hình học hộp âm dương FEFCO 0301 trong src/boxes/fefco-0301.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { fefco0301 } from './fefco-0301';

describe('fefco-0301', () => {
  it('sinh đúng cấu trúc khay đáy gồm 9 panel và 8 đường cấn', () => {
    const nodes = fefco0301.build({
      l: 250,
      w: 180,
      h: 80,
      t: 2,
      opts: { part: 'base' },
    });

    // 1 mặt đáy + 4 thành + 4 tai dán góc = 9 panels
    expect(nodes).toHaveLength(9);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(9);

    const dieline = buildDieline(layouts);
    // 9 panels -> 1 gốc + 8 con -> đúng 8 đường cấn
    expect(dieline.crease).toHaveLength(8);
  });

  it('hộp bao bbox khay đáy khớp chuẩn xác với hình chữ thập (L + 2H) × (W + 2H)', () => {
    // Với L=250, W=180, H=80:
    // Thành trái cao 80 (-80 đến 0), mặt đáy 250 (0 đến 250), thành phải cao 80 (250 đến 330)
    // -> minX = -80, width = 250 + 160 = 410 mm
    // Thành trên cao 80 (-80 đến 0), mặt đáy 180 (0 đến 180), thành dưới cao 80 (180 đến 260)
    // -> minY = -80, height = 180 + 160 = 340 mm
    const nodes = fefco0301.build({
      l: 250,
      w: 180,
      h: 80,
      t: 2,
      opts: { part: 'base' },
    });

    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    expect(dieline.bbox).toEqual([-80, -80, 410, 340]);
  });

  it('khay nắp tự động tính kích thước phủ bì nhỉnh hơn đáy theo độ hở và độ dày giấy', () => {
    const l = 200;
    const w = 150;
    const h = 70;
    const t = 2;
    const clearance = 2;
    const lidHeight = 35;

    const nodes = fefco0301.build({
      l,
      w,
      h,
      t,
      opts: { part: 'lid', clearance, lidHeight },
    });

    const face = nodes.find((n) => n.id === 'tray-face');
    const wallTop = nodes.find((n) => n.id === 'tray-wall-top');

    // lLid = l + 2*t + clearance = 200 + 4 + 2 = 206
    expect(face?.len).toBe(206);
    // wLid = w + 2*t + clearance = 150 + 4 + 2 = 156
    expect(face?.depth).toBe(156);
    // hLid = 35
    expect(wallTop?.depth).toBe(35);
  });
});
