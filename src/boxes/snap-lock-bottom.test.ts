import { describe, expect, it } from 'vitest';
import { snapLockBottomBox, snapLockBottom } from './snap-lock-bottom';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('snapLockBottom (ECMA A50.20 / 1-2-3 bottom)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp nắp gài đáy khoá cài 1-2-3', () => {
    expect(snapLockBottomBox.id).toBe('snap-lock-bottom-box');
    expect(snapLockBottom.id).toBe('snap-lock-bottom-box');
    expect(snapLockBottomBox.code).toBe('ECMA A50.20 / FEFCO 0215');
    expect(snapLockBottomBox.category).toBe('tuck');
  });

  it('tạo đúng 13 panels bao gồm thân, nắp gài trên và 4 cánh đáy khoá 1-2-3', () => {
    const panels = snapLockBottomBox.build({
      l: 80,
      w: 60,
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
    expect(ids).toContain('dust-top-left');
    expect(ids).toContain('dust-top-right');
    expect(ids).toContain('bot-back-lock');
    expect(ids).toContain('bot-front-tongue');
    expect(ids).toContain('bot-left-lock');
    expect(ids).toContain('bot-right-lock');

    // Nắp trên gắn vào Mặt sau, các cánh đáy gắn vào Mặt sau, hông trái, trước, hông phải
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-back');
    expect(panels.find((p) => p.id === 'bot-back-lock')?.parent).toBe('panel-back');
    expect(panels.find((p) => p.id === 'bot-left-lock')?.parent).toBe('panel-left');
    expect(panels.find((p) => p.id === 'bot-front-tongue')?.parent).toBe('panel-front');
    expect(panels.find((p) => p.id === 'bot-right-lock')?.parent).toBe('panel-right');
  });

  it('layout và dieline tính toán đường nét và bbox chuẩn xác', () => {
    const panels = snapLockBottomBox.build({
      l: 80,
      w: 60,
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

    // Bề rộng = glue(15) + Back(80) + Left(60) + Front(80) + Right(60) = 295
    expect(width).toBeCloseTo(295, 1);
  });
});
