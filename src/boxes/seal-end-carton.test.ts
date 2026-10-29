import { describe, expect, it } from 'vitest';
import { sealEndCarton } from './seal-end-carton';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('sealEndCarton (ECMA A10.20)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp dán keo hai đầu', () => {
    expect(sealEndCarton.id).toBe('seal-end-carton');
    expect(sealEndCarton.code).toBe('ECMA A10.20');
    expect(sealEndCarton.category).toBe('tuck');
    expect(sealEndCarton.defaults).toEqual({
      l: 100,
      w: 50,
      h: 150,
      t: 0.5,
    });
  });

  it('tạo đúng 13 panels bao gồm thân, 4 cánh dán nắp trên và 4 cánh dán đáy', () => {
    const panels = sealEndCarton.build({
      l: 100,
      w: 50,
      h: 150,
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
    expect(ids).toContain('top-a');
    expect(ids).toContain('top-c');
    expect(ids).toContain('dust-top-b');
    expect(ids).toContain('dust-top-d');
    expect(ids).toContain('bot-a');
    expect(ids).toContain('bot-b');
    expect(ids).toContain('bot-c');
    expect(ids).toContain('bot-d');

    // Cánh ngoài top-a và bot-a có cờ glue
    expect(panels.find((p) => p.id === 'top-a')?.glue).toBe(true);
    expect(panels.find((p) => p.id === 'bot-a')?.glue).toBe(true);
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const panels = sealEndCarton.build({
      l: 100,
      w: 50,
      h: 150,
      t: 0.5,
      opts: { glueWidth: 15 },
    });

    const positioned = layoutPanels(panels);
    const dieline = buildDieline(positioned);

    expect(dieline.cut.length).toBeGreaterThan(0);
    expect(dieline.crease.length).toBe(12);

    const [, , width, height] = dieline.bbox;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    // Bề rộng = glue(15) + A(100) + B(50) + C(100) + D(50) = 315
    expect(width).toBeCloseTo(315, 1);
    // Bề cao = flap(25) + body(150) + flap(25) = 200
    expect(height).toBeCloseTo(200, 1);
  });
});
