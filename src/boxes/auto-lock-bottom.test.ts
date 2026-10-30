import { describe, expect, it } from 'vitest';
import { autoLockBottomBox, autoLockBottom } from './auto-lock-bottom';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('autoLockBottom (ALB)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp đáy khoá tự động ECMA A60.20', () => {
    expect(autoLockBottomBox.id).toBe('auto-lock-bottom-box');
    expect(autoLockBottom.id).toBe('auto-lock-bottom-box');
    expect(autoLockBottomBox.code).toBe('ECMA A60.20');
    expect(autoLockBottomBox.category).toBe('tuck');
  });

  it('tạo đúng 13 panels bao gồm thân, nắp gài trên và 4 cánh đáy khoá tự động', () => {
    const panels = autoLockBottomBox.build({
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
    expect(ids).toContain('dust-top-left');
    expect(ids).toContain('dust-top-right');
    expect(ids).toContain('bot-crash-back');
    expect(ids).toContain('bot-crash-left');
    expect(ids).toContain('bot-crash-front');
    expect(ids).toContain('bot-crash-right');

    // Nắp trên gắn vào Mặt sau, các cánh đáy gắn vào cạnh đáy của Mặt sau, hông trái, trước, hông phải
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-back');
    expect(panels.find((p) => p.id === 'bot-crash-back')?.parent).toBe('panel-back');
    expect(panels.find((p) => p.id === 'bot-crash-left')?.parent).toBe('panel-left');
    expect(panels.find((p) => p.id === 'bot-crash-front')?.parent).toBe('panel-front');
    expect(panels.find((p) => p.id === 'bot-crash-right')?.parent).toBe('panel-right');
  });

  it('layout và dieline tính toán đường nét và bbox chuẩn xác', () => {
    const panels = autoLockBottomBox.build({
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
  });
});
