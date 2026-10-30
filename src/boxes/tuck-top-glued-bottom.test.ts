import { describe, expect, it } from 'vitest';
import { tuckTopGluedBottomBox, tuckTopGluedBottom } from './tuck-top-glued-bottom';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('tuckTopGluedBottom (ECMA A20/A10)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp nắp gài trên đáy dán keo', () => {
    expect(tuckTopGluedBottomBox.id).toBe('tuck-top-glued-bottom-box');
    expect(tuckTopGluedBottom.id).toBe('tuck-top-glued-bottom-box');
    expect(tuckTopGluedBottomBox.code).toBe('ECMA A20 / A10 COMBINATION');
    expect(tuckTopGluedBottomBox.category).toBe('tuck');
  });

  it('tạo đúng 13 panels bao gồm thân, nắp gài trên và 4 cánh đáy dán keo', () => {
    const panels = tuckTopGluedBottomBox.build({
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
    expect(ids).toContain('bot-seal-inner');
    expect(ids).toContain('bot-seal-outer');
    expect(ids).toContain('dust-bot-left');
    expect(ids).toContain('dust-bot-right');

    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-back');
    expect(panels.find((p) => p.id === 'bot-seal-inner')?.parent).toBe('panel-back');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const panels = tuckTopGluedBottomBox.build({
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

    // Bề rộng = glue(15) + Back(80) + Left(50) + Front(80) + Right(50) = 275
    expect(width).toBeCloseTo(275, 1);
  });
});
