import { describe, expect, it } from 'vitest';
import { crashLockHangTabBox, crashLockHangTab } from './crash-lock-hang-tab';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('crashLockHangTab (ECMA A60 + Hang Tab)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp tai treo đáy khoá tự động', () => {
    expect(crashLockHangTabBox.id).toBe('crash-lock-hang-tab-box');
    expect(crashLockHangTab.id).toBe('crash-lock-hang-tab-box');
    expect(crashLockHangTabBox.code).toBe('ECMA A60 + HANG TAB');
    expect(crashLockHangTabBox.category).toBe('tuck');
  });

  it('tạo đúng 15 panels bao gồm thân, tai treo header đôi, nắp gài trên và 4 cánh đáy khoá tự động', () => {
    const panels = crashLockHangTabBox.build({
      l: 75,
      w: 40,
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
    expect(ids).toContain('bot-crash-back');
    expect(ids).toContain('bot-crash-front');
    expect(ids).toContain('bot-crash-left');
    expect(ids).toContain('bot-crash-right');

    expect(panels.find((p) => p.id === 'header')?.parent).toBe('panel-back');
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-front');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const panels = crashLockHangTabBox.build({
      l: 75,
      w: 40,
      h: 120,
      t: 0.5,
      opts: { header: 35, glueWidth: 15, tuckDepth: 16 },
    });

    const positioned = layoutPanels(panels);
    const dieline = buildDieline(positioned);

    expect(dieline.cut.length).toBeGreaterThan(0);
    expect(dieline.crease.length).toBe(14);

    const [, , width, height] = dieline.bbox;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    // Bề rộng = glue(15) + Back(75) + Left(40) + Front(75) + Right(40) = 245
    expect(width).toBeCloseTo(245, 1);
  });
});
