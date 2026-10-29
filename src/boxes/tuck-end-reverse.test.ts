import { describe, expect, it } from 'vitest';
import { tuckEndReverse } from './tuck-end-reverse';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('tuckEndReverse (RTE)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp gài ngược', () => {
    expect(tuckEndReverse.id).toBe('tuck-end-reverse');
    expect(tuckEndReverse.code).toBe('RTE');
    expect(tuckEndReverse.category).toBe('tuck');
    expect(tuckEndReverse.defaults).toEqual({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
    });
  });

  it('tạo đúng 13 panels và các liên kết nắp ngược chiều nhau', () => {
    const panels = tuckEndReverse.build({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
      opts: {},
    });

    expect(panels.length).toBe(13);

    const ids = panels.map((p) => p.id);
    expect(ids).toContain('panel-a');
    expect(ids).toContain('glue');
    expect(ids).toContain('panel-b');
    expect(ids).toContain('panel-c');
    expect(ids).toContain('panel-d');
    expect(ids).toContain('top-lid');
    expect(ids).toContain('top-tuck');
    expect(ids).toContain('bot-lid');
    expect(ids).toContain('bot-tuck');
    expect(ids).toContain('dust-top-b');
    expect(ids).toContain('dust-bot-b');
    expect(ids).toContain('dust-top-d');
    expect(ids).toContain('dust-bot-d');

    // Nắp trên gắn vào C (sau), nắp đáy gắn vào A (trước)
    const topLid = panels.find((p) => p.id === 'top-lid');
    const botLid = panels.find((p) => p.id === 'bot-lid');

    expect(topLid?.parent).toBe('panel-c');
    expect(topLid?.edge).toBe('top');

    expect(botLid?.parent).toBe('panel-a');
    expect(botLid?.edge).toBe('bottom');
  });

  it('layout và dieline tính toán bbox và đường nét chuẩn xác', () => {
    const panels = tuckEndReverse.build({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    });

    const positioned = layoutPanels(panels);
    const dieline = buildDieline(positioned);

    expect(dieline.cut.length).toBeGreaterThan(0);
    expect(dieline.crease.length).toBe(12); // 12 nếp cấn cho 13 panels

    const [, , width, height] = dieline.bbox;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    // Bề rộng = glue(15) + A(80) + B(50) + C(80) + D(50) = 275
    expect(width).toBeCloseTo(275, 1);
    // Bề cao = top-tuck(16) + top-lid(50) + body(140) + bot-lid(50) + bot-tuck(16) = 272
    expect(height).toBeCloseTo(272, 1);
  });
});
