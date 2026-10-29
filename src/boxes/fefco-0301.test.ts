// Kiểm thử hình học thùng âm dương FEFCO 0301 trong src/boxes/fefco-0301.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { fefco0301 } from './fefco-0301';

describe('fefco-0301', () => {
  it('sinh đúng cấu trúc tấm phôi chữ nhật nguyên vẹn 9 panel cho khay đáy', () => {
    const nodes = fefco0301.build({
      l: 1105,
      w: 585,
      h: 95,
      t: 3,
      opts: { part: 'base' },
    });

    // 1 mặt chính + 4 thành + 4 góc vuông = 9 panels
    expect(nodes).toHaveLength(9);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(9);

    const dieline = buildDieline(layouts);
    // Kích thước phôi đáy theo đúng ảnh mẫu của xưởng:
    // Chiều dài phôi: 1105 + 2*95 = 1295 mm
    // Chiều rộng phôi: 585 + 2*95 = 775 mm (hoặc 769mm)
    expect(dieline.bbox[2]).toBe(1295);
    expect(dieline.bbox[3]).toBe(775);
  });

  it('sinh đầy đủ 18 panel khi chọn cả bộ nắp và đáy (2 tấm phôi độc lập)', () => {
    const nodes = fefco0301.build({
      l: 400,
      w: 300,
      h: 120,
      t: 3,
      opts: { part: 'both' },
    });

    // 9 (nắp) + 9 (đáy) = 18 panels (không dùng panel cầu giả)
    expect(nodes).toHaveLength(18);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(18);

    const dieline = buildDieline(layouts);
    // 2 tấm phôi rời nhau nên không có đường nối dính
    expect(dieline.cut.length).toBeGreaterThan(0);
  });

  it('thùng nắp tự động tính kích thước phủ bì nhỉnh hơn thùng đáy để trùm khít', () => {
    const l = 400;
    const w = 300;
    const h = 120;
    const t = 3;

    const nodes = fefco0301.build({
      l,
      w,
      h,
      t,
      opts: { part: 'lid' },
    });

    const face = nodes.find((n) => n.id === 'tray-lid-face');
    expect(face).toBeDefined();
    // Nắp dài hơn và rộng hơn đáy
    expect(face!.len).toBeGreaterThan(l);
    expect(face!.depth).toBeGreaterThan(w);
  });

  it('hỗ trợ cấu hình độ rộng rãnh xẻ (slotWidth) chuẩn xác cho các góc chạp', () => {
    const slot = 8;
    const h = 100;
    const w = 400;

    const nodes = fefco0301.build({
      l: 600,
      w,
      h,
      t: 5,
      opts: { part: 'base', slotWidth: slot },
    });

    // Thành trái bị trừ đúng khe rãnh s ở 2 đầu
    const wallLeft = nodes.find((n) => n.id === 'tray-base-wall-left')!;
    expect(wallLeft.len).toBe(w - slot);
    expect(wallLeft.offset).toBe(slot / 2);

    // Tai góc có chiều dài trừ đúng s/2
    const cornerTL = nodes.find((n) => n.id === 'tray-base-corner-tl')!;
    expect(cornerTL.len).toBe(h - slot / 2);
  });
});
