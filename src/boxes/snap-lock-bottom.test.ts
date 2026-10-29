import { describe, expect, it } from 'vitest';
import { snapLockBottom } from './snap-lock-bottom';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('snapLockBottom (ECMA A50.20 / 1-2-3 bottom)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp nắp gài đáy khoá cài 1-2-3', () => {
    expect(snapLockBottom.id).toBe('snap-lock-bottom');
    expect(snapLockBottom.code).toBe('ECMA A50.20');
    expect(snapLockBottom.category).toBe('tuck');
    expect(snapLockBottom.defaults).toEqual({
      l: 80,
      w: 60,
      h: 140,
      t: 0.5,
    });
  });

  it('tạo đúng 13 panels bao gồm thân, nắp gài trên và 4 cánh đáy khoá 1-2-3', () => {
    const panels = snapLockBottom.build({
      l: 80,
      w: 60,
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
    const panels = snapLockBottom.build({
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

    // Bề rộng = glue(15) + A(80) + B(60) + C(80) + D(60) = 295
    expect(width).toBeCloseTo(295, 1);
    // Bề cao = top-tuck(16) + top-lid(60) + body(140) + bot-a(v=30 + b=14) = 260
    expect(height).toBeCloseTo(260, 1);
  });
});
