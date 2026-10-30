import { describe, expect, it } from 'vitest';
import { sealEndCarton } from './seal-end-carton';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('sealEndCarton (ECMA A10.20)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp dán keo hai đầu', () => {
    expect(sealEndCarton.id).toBe('seal-end-carton');
    expect(sealEndCarton.code).toBe('ECMA A10.20');
    expect(sealEndCarton.category).toBe('tuck');
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
    expect(ids).toContain('panel-back');
    expect(ids).toContain('glue');
    expect(ids).toContain('panel-left');
    expect(ids).toContain('panel-front');
    expect(ids).toContain('panel-right');
    expect(ids).toContain('top-seal-inner');
    expect(ids).toContain('top-seal-outer');
    expect(ids).toContain('dust-top-left');
    expect(ids).toContain('dust-top-right');
    expect(ids).toContain('bot-seal-inner');
    expect(ids).toContain('bot-seal-outer');
    expect(ids).toContain('dust-bot-left');
    expect(ids).toContain('dust-bot-right');
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

    // Bề rộng = glue(15) + Back(100) + Left(50) + Front(100) + Right(50) = 315
    expect(width).toBeCloseTo(315, 1);
  });
});
