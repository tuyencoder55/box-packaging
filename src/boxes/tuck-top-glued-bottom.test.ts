import { describe, expect, it } from 'vitest';
import { tuckTopGluedBottom } from './tuck-top-glued-bottom';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('tuckTopGluedBottom (ECMA A20/A10)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp nắp gài trên đáy dán keo', () => {
    expect(tuckTopGluedBottom.id).toBe('tuck-top-glued-bottom');
    expect(tuckTopGluedBottom.code).toBe('ECMA A20/A10');
    expect(tuckTopGluedBottom.category).toBe('tuck');
    expect(tuckTopGluedBottom.defaults).toEqual({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
    });
  });

  it('tạo đúng 13 panels bao gồm thân, nắp gài trên và 4 cánh đáy dán keo', () => {
    const panels = tuckTopGluedBottom.build({
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

    // Nắp trên gắn vào C, cánh đáy ngoài A có cờ glue
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-c');
    expect(panels.find((p) => p.id === 'bot-a')?.glue).toBe(true);
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const panels = tuckTopGluedBottom.build({
      l: 80,
      w: 50,
      h: 140,
      t: 0.5,
      opts: { glueWidth: 15, tuckDepth: 16 },
    });

    const positioned = layoutPanels(panels);
    const dieline = buildDieline(positioned);

    expect(dieline.cut.length).toBeGreaterThan(0);
    expect(dieline.crease.length).toBe(12);

    const [, , width, height] = dieline.bbox;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    // Bề rộng = glue(15) + A(80) + B(50) + C(80) + D(50) = 275
    expect(width).toBeCloseTo(275, 1);
    // Bề cao = top-tuck(16) + top-lid(50) + body(140) + bot-a(25) = 231
    expect(height).toBeCloseTo(231, 1);
  });
});
