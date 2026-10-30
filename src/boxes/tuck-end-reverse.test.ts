import { describe, expect, it } from 'vitest';
import { reverseTuckEndBox, tuckEndReverse } from './tuck-end-reverse';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('tuckEndReverse (RTE)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp gài ngược ECMA A20.20', () => {
    expect(reverseTuckEndBox.id).toBe('reverse-tuck-end-box');
    expect(tuckEndReverse.id).toBe('reverse-tuck-end-box');
    expect(reverseTuckEndBox.code).toBe('ECMA A20.20');
    expect(reverseTuckEndBox.category).toBe('tuck');
  });

  it('tạo đúng 13 panels và các liên kết nắp ngược chiều nhau chuẩn ECMA', () => {
    const panels = reverseTuckEndBox.build({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
      opts: {},
    });

    expect(panels.length).toBe(13);

    const ids = panels.map((p) => p.id);
    expect(ids).toContain('panel-back');
    expect(ids).toContain('glue');
    expect(ids).toContain('panel-left');
    expect(ids).toContain('panel-front');
    expect(ids).toContain('panel-right');
    expect(ids).toContain('top-lid');
    expect(ids).toContain('top-tuck');
    expect(ids).toContain('bot-lid');
    expect(ids).toContain('bot-tuck');
    expect(ids).toContain('dust-top-left');
    expect(ids).toContain('dust-bot-left');
    expect(ids).toContain('dust-top-right');
    expect(ids).toContain('dust-bot-right');

    // Nắp trên gắn vào Mặt sau, nắp đáy gắn vào Mặt trước
    const topLid = panels.find((p) => p.id === 'top-lid');
    const botLid = panels.find((p) => p.id === 'bot-lid');

    expect(topLid?.parent).toBe('panel-back');
    expect(topLid?.edge).toBe('top');

    expect(botLid?.parent).toBe('panel-front');
    expect(botLid?.edge).toBe('bottom');
  });

  it('layout và dieline tính toán bbox và đường nét chuẩn xác', () => {
    const panels = reverseTuckEndBox.build({
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

    // Bề rộng = glue(15) + Back(80) + Left(50) + Front(80) + Right(50) = 275
    expect(width).toBeCloseTo(275, 1);
    // Bề cao = top-tuck(16) + top-lid(50) + body(140) + bot-lid(50) + bot-tuck(16) = 272
    expect(height).toBeCloseTo(272, 1);
  });
});
