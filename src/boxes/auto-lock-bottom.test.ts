import { describe, expect, it } from 'vitest';
import { autoLockBottom } from './auto-lock-bottom';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('autoLockBottom (ALB)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp đáy khoá tự động', () => {
    expect(autoLockBottom.id).toBe('auto-lock-bottom');
    expect(autoLockBottom.code).toBe('ALB');
    expect(autoLockBottom.category).toBe('auto-lock');
    expect(autoLockBottom.defaults).toEqual({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
    });
  });

  it('tạo đúng 13 panels bao gồm thân, nắp gài trên và 4 cánh đáy khoá', () => {
    const panels = autoLockBottom.build({
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
    expect(ids).toContain('dust-top-b');
    expect(ids).toContain('dust-top-d');
    expect(ids).toContain('bot-a');
    expect(ids).toContain('bot-b');
    expect(ids).toContain('bot-c');
    expect(ids).toContain('bot-d');

    // Nắp trên gắn vào C, các cánh đáy gắn vào cạnh đáy của A, B, C, D
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-c');
    expect(panels.find((p) => p.id === 'bot-a')?.parent).toBe('panel-a');
    expect(panels.find((p) => p.id === 'bot-b')?.parent).toBe('panel-b');
    expect(panels.find((p) => p.id === 'bot-c')?.parent).toBe('panel-c');
    expect(panels.find((p) => p.id === 'bot-d')?.parent).toBe('panel-d');
  });

  it('layout và dieline tính toán đường nét và bbox chuẩn xác', () => {
    const panels = autoLockBottom.build({
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
    // Bề cao = top-tuck(16) + top-lid(50) + body(140) + botDepth(30) = 236
    expect(height).toBeCloseTo(236, 1);
  });
});
