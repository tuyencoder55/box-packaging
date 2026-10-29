import { describe, expect, it } from 'vitest';
import { hangTabTuckEnd } from './hang-tab-tuck-end';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('hangTabTuckEnd (ECMA A20 + Hang Tab)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp nắp gài có tai treo', () => {
    expect(hangTabTuckEnd.id).toBe('hang-tab-tuck-end');
    expect(hangTabTuckEnd.code).toBe('ECMA A20 + Hang Tab');
    expect(hangTabTuckEnd.category).toBe('tuck');
    expect(hangTabTuckEnd.defaults).toEqual({
      l: 75,
      w: 30,
      h: 120,
      t: 0.5,
    });
  });

  it('tạo đúng 14 panels bao gồm thân, tai treo header, nắp gài trên và nắp gài đáy', () => {
    const panels = hangTabTuckEnd.build({
      l: 75,
      w: 30,
      h: 120,
      t: 0.5,
      opts: { headerHeight: 35 },
    });

    expect(panels.length).toBe(14);

    const ids = panels.map((p) => p.id);
    expect(ids).toContain('panel-a');
    expect(ids).toContain('glue');
    expect(ids).toContain('panel-b');
    expect(ids).toContain('panel-c');
    expect(ids).toContain('panel-d');
    expect(ids).toContain('hang-header');
    expect(ids).toContain('top-lid');
    expect(ids).toContain('top-tuck');
    expect(ids).toContain('dust-top-b');
    expect(ids).toContain('dust-top-d');
    expect(ids).toContain('bot-lid');
    expect(ids).toContain('bot-tuck');
    expect(ids).toContain('dust-bot-b');
    expect(ids).toContain('dust-bot-d');

    // Tai treo gắn vào C top, nắp trên gắn vào A top
    expect(panels.find((p) => p.id === 'hang-header')?.parent).toBe('panel-c');
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-a');
    expect(panels.find((p) => p.id === 'bot-lid')?.parent).toBe('panel-c');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const panels = hangTabTuckEnd.build({
      l: 75,
      w: 30,
      h: 120,
      t: 0.5,
      opts: { headerHeight: 35, glueWidth: 15, tuckDepth: 16 },
    });

    const positioned = layoutPanels(panels);
    const dieline = buildDieline(positioned);

    expect(dieline.cut.length).toBeGreaterThan(0);
    expect(dieline.crease.length).toBe(13); // 13 nếp cấn cho 14 panels

    const [, , width, height] = dieline.bbox;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    // Bề rộng = glue(15) + A(75) + B(30) + C(75) + D(30) = 225
    expect(width).toBeCloseTo(225, 1);
    // Bề cao = header(35) [hoặc top-tuck(16)+top-lid(30)=46] + body(120) + bot-lid(30) + bot-tuck(16)
    // 46 + 120 + 46 = 212
    expect(height).toBeCloseTo(212, 1);
  });
});
