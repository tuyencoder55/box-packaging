import { describe, expect, it } from 'vitest';
import { hangTabTuckEndBox, hangTabTuckEnd } from './hang-tab-tuck-end';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('hangTabTuckEnd (ECMA A20 + Hang Tab)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp nắp gài có tai treo', () => {
    expect(hangTabTuckEndBox.id).toBe('hang-tab-tuck-end-box');
    expect(hangTabTuckEnd.id).toBe('hang-tab-tuck-end-box');
    expect(hangTabTuckEndBox.code).toBe('ECMA A20 + HANG TAB');
    expect(hangTabTuckEndBox.category).toBe('tuck');
  });

  it('tạo đúng 15 panels bao gồm thân, tai treo header đôi, nắp gài trên và nắp gài đáy', () => {
    const panels = hangTabTuckEndBox.build({
      l: 75,
      w: 30,
      h: 120,
      t: 0.5,
      opts: { header: 35 },
    });

    expect(panels.length).toBe(15);

    const ids = panels.map((p) => p.id);
    expect(ids).toContain('panel-back');
    expect(ids).toContain('glue');
    expect(ids).toContain('panel-left');
    expect(ids).toContain('panel-front');
    expect(ids).toContain('panel-right');
    expect(ids).toContain('header');
    expect(ids).toContain('header-inner');
    expect(ids).toContain('top-lid');
    expect(ids).toContain('top-tuck');
    expect(ids).toContain('dust-top-left');
    expect(ids).toContain('dust-top-right');
    expect(ids).toContain('bot-lid');
    expect(ids).toContain('bot-tuck');
    expect(ids).toContain('dust-bot-left');
    expect(ids).toContain('dust-bot-right');

    // Tai treo gắn vào Mặt sau, nắp trên gắn vào Mặt trước, nắp đáy gắn vào Mặt sau
    expect(panels.find((p) => p.id === 'header')?.parent).toBe('panel-back');
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-front');
    expect(panels.find((p) => p.id === 'bot-lid')?.parent).toBe('panel-back');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const panels = hangTabTuckEndBox.build({
      l: 75,
      w: 30,
      h: 120,
      t: 0.5,
      opts: { header: 35, glueWidth: 15, tuckDepth: 16 },
    });

    const positioned = layoutPanels(panels);
    const dieline = buildDieline(positioned);

    expect(dieline.cut.length).toBeGreaterThan(0);
    expect(dieline.crease.length).toBe(14); // 14 nếp cấn cho 15 panels

    const [, , width, height] = dieline.bbox;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    // Bề rộng = glue(15) + Back(75) + Left(30) + Front(75) + Right(30) = 225
    expect(width).toBeCloseTo(225, 1);
  });
});
