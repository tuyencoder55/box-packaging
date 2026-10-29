// Kiểm thử hình học hộp mailer FEFCO 0427 trong src/boxes/fefco-0427.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { fefco0427 } from './fefco-0427';

describe('fefco-0427', () => {
  it('sinh đúng cấu trúc 16 panel và 15 đường cấn', () => {
    const nodes = fefco0427.build({
      l: 250,
      w: 200,
      h: 80,
      t: 2,
      opts: {},
    });

    // 1 đáy + 5 nắp/thành sau + 2 thành trước + 4 hông trái + 4 hông phải = 16 panels
    expect(nodes).toHaveLength(16);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(16);

    const dieline = buildDieline(layouts);
    // 16 panels -> 1 gốc + 15 panel con -> đúng 15 đường cấn
    expect(dieline.crease).toHaveLength(15);
  });

  it('hộp bao bbox mở rộng đúng theo các tai và thành cuộn mép', () => {
    const nodes = fefco0427.build({
      l: 250,
      w: 200,
      h: 80,
      t: 2,
      opts: { tuckDepth: 35 },
    });

    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    // Chiều ngang: hông trái ngoài (80) + trong (78) = 158 mm bên trái -> minX = -158
    // Bên phải: L (250) + 158 = 408 mm -> maxX = 408 -> width = 566 mm
    expect(dieline.bbox[0]).toBe(-158);
    expect(dieline.bbox[2]).toBe(566);

    // Chiều dọc: thành sau (80) + nắp (200) + lưỡi gài (35) = 315 mm phía trên -> minY = -315
    // Phía dưới: W (200) + thành trước (80) + trước trong (78) = 358 mm -> maxY = 358 -> height = 673 mm
    expect(dieline.bbox[1]).toBe(-315);
    expect(dieline.bbox[3]).toBe(673);
  });
});

